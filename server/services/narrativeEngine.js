/**
 * Life Narrative Engine
 * Generates compassionate life story summaries and tracks growth journey
 * Implements long-context memory and recurring pattern detection
 * 
 * CRITICAL: ALL Gemini calls wrapped with geminiLimiter
 */

const { GoogleGenAI } = require('@google/genai');
const geminiLimiter = require('../utils/geminiLimiter');
const CognitiveProfile = require('../models/CognitiveProfile');
const Session = require('../models/Session');

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

class NarrativeEngine {
    /**
     * Parse JSON from response
     */
    parseJSON(text) {
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Generate comprehensive life narrative
     */
    async generateLifeNarrative(userId) {
        try {
            const profile = await CognitiveProfile.findOne({ userId });
            if (!profile) {
                throw new Error('Profile not found');
            }

            const sessions = await Session.find({ userId, status: 'completed' })
                .sort({ endTime: -1 })
                .limit(20);

            // Build context
            const keyEvents = profile.life_narrative?.key_events || [];
            const growthMilestones = profile.life_narrative?.growth_milestones || [];
            const recentSummaries = sessions
                .filter(s => s.summary?.overview)
                .map(s => s.summary.overview)
                .slice(0, 10);

            const prompt = `Generate a compassionate, empowering life narrative for this user.

Key Life Events:
${keyEvents.map(e => `- ${e.event} (${e.emotional_impact}): ${e.growth_noted || 'N/A'}`).join('\n') || 'None recorded yet'}

Growth Milestones:
${growthMilestones.map(m => `- ${m.milestone}: ${m.description}`).join('\n') || 'None recorded yet'}

Recent Session Insights:
${recentSummaries.join('\n') || 'Building history...'}

Current State:
- Baseline Mood: ${profile.baseline_mood}
- Total Sessions: ${profile.stats.total_sessions}
- Primary Concerns: ${profile.primary_concerns.map(c => c.concern).join(', ') || 'None'}
- Goals: ${profile.goals.filter(g => g.status === 'active').map(g => g.goal).join(', ') || 'None'}

Create a narrative that:
1. Acknowledges their journey with compassion
2. Highlights growth and resilience
3. Identifies recurring themes
4. Celebrates progress
5. Offers hope and direction

Return ONLY valid JSON:
{
  "narrative": "2-3 paragraph compassionate story of their journey",
  "recurring_themes": ["theme1", "theme2", "theme3"],
  "growth_trajectory": "overall direction and progress",
  "key_strengths": ["strength1", "strength2", "strength3"],
  "areas_of_focus": ["area1", "area2"],
  "milestone_moments": ["moment1", "moment2"],
  "future_outlook": "hopeful perspective on their path forward",
  "narrative_tone": "warm|encouraging|reflective|hopeful"
}`;

            const config = {
                model: MODEL_NAME,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 1000,
                }
            };

            // CRITICAL: Wrap with limiter
            const response = await geminiLimiter.schedule({ id: 'generateLifeNarrative' }, async () => {
                console.log('🤖 Gemini API call (generateLifeNarrative)');
                return await ai.models.generateContent(config);
            });

            const narrative = this.parseJSON(response.text);

            if (!narrative) {
                throw new Error('Failed to parse narrative response');
            }

            // Update profile with narrative themes
            if (!profile.life_narrative) {
                profile.life_narrative = { key_events: [], recurring_themes: [], growth_milestones: [] };
            }
            profile.life_narrative.recurring_themes = narrative.recurring_themes;
            await profile.save();

            return {
                ...narrative,
                generatedAt: new Date(),
                sessionsAnalyzed: sessions.length,
                profileAge: Math.floor((Date.now() - profile.createdAt.getTime()) / (1000 * 60 * 60 * 24))
            };
        } catch (error) {
            console.error('Life narrative generation error:', error);
            throw error;
        }
    }

    /**
     * Detect recurring emotional cycles and patterns
     */
    async detectRecurringPatterns(userId, days = 60) {
        try {
            const profile = await CognitiveProfile.findOne({ userId });
            if (!profile) {
                throw new Error('Profile not found');
            }

            const patterns = profile.getEmotionalTrajectory(days);
            if (patterns.length < 14) {
                return {
                    patterns: [],
                    cycles: [],
                    message: 'Not enough data to detect patterns (need at least 14 days)',
                    dataPoints: patterns.length
                };
            }

            // Analyze by day of week
            const dayPatterns = {};
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            patterns.forEach(p => {
                const day = new Date(p.date).getDay();
                if (!dayPatterns[day]) {
                    dayPatterns[day] = { intensities: [], moods: {} };
                }
                dayPatterns[day].intensities.push(p.intensity);
                dayPatterns[day].moods[p.mood] = (dayPatterns[day].moods[p.mood] || 0) + 1;
            });

            // Find weekly patterns
            const weeklyInsights = [];
            Object.entries(dayPatterns).forEach(([day, data]) => {
                if (data.intensities.length < 3) return;
                
                const avg = data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length;
                const dominantMood = Object.entries(data.moods).sort((a, b) => b[1] - a[1])[0];

                if (avg > 0.7) {
                    weeklyInsights.push({
                        day: dayNames[day],
                        pattern: 'challenging',
                        intensity: avg,
                        dominantMood: dominantMood[0],
                        description: `${dayNames[day]}s tend to be more emotionally intense`
                    });
                } else if (avg < 0.3) {
                    weeklyInsights.push({
                        day: dayNames[day],
                        pattern: 'positive',
                        intensity: avg,
                        dominantMood: dominantMood[0],
                        description: `${dayNames[day]}s are typically better days`
                    });
                }
            });

            // Detect emotional cycles (highs and lows)
            const cycles = this.detectEmotionalCycles(patterns);

            // Analyze time-of-day patterns (if context available)
            const contextPatterns = patterns.filter(p => p.context);
            const contextInsights = this.analyzeContextPatterns(contextPatterns);

            return {
                patterns: weeklyInsights,
                cycles,
                contextInsights,
                dataPoints: patterns.length,
                analysisWindow: `${days} days`,
                message: weeklyInsights.length > 0 ? 'Patterns detected in your emotional journey' : 'No clear patterns detected yet'
            };
        } catch (error) {
            console.error('Pattern detection error:', error);
            throw error;
        }
    }

    /**
     * Detect emotional cycles (peaks and valleys)
     */
    detectEmotionalCycles(patterns) {
        if (patterns.length < 7) return [];

        const cycles = [];
        let currentCycle = null;

        for (let i = 1; i < patterns.length - 1; i++) {
            const prev = patterns[i - 1].intensity;
            const curr = patterns[i].intensity;
            const next = patterns[i + 1].intensity;

            // Detect peak
            if (curr > prev && curr > next && curr > 0.6) {
                if (currentCycle && currentCycle.type === 'low') {
                    currentCycle.duration = i - currentCycle.startIndex;
                    cycles.push(currentCycle);
                }
                currentCycle = {
                    type: 'high',
                    startIndex: i,
                    intensity: curr,
                    mood: patterns[i].mood,
                    date: patterns[i].date
                };
            }
            // Detect valley
            else if (curr < prev && curr < next && curr < 0.4) {
                if (currentCycle && currentCycle.type === 'high') {
                    currentCycle.duration = i - currentCycle.startIndex;
                    cycles.push(currentCycle);
                }
                currentCycle = {
                    type: 'low',
                    startIndex: i,
                    intensity: curr,
                    mood: patterns[i].mood,
                    date: patterns[i].date
                };
            }
        }

        // Calculate average cycle length
        if (cycles.length > 0) {
            const avgDuration = cycles.reduce((sum, c) => sum + (c.duration || 0), 0) / cycles.length;
            return {
                detected: true,
                cycles: cycles.slice(-5), // Last 5 cycles
                averageCycleDuration: Math.round(avgDuration),
                totalCycles: cycles.length
            };
        }

        return { detected: false, cycles: [], message: 'No clear emotional cycles detected' };
    }

    /**
     * Analyze context patterns
     */
    analyzeContextPatterns(contextPatterns) {
        if (contextPatterns.length < 5) return [];

        const contextMap = {};
        contextPatterns.forEach(p => {
            const context = p.context.toLowerCase();
            if (!contextMap[context]) {
                contextMap[context] = { count: 0, intensities: [], moods: [] };
            }
            contextMap[context].count++;
            contextMap[context].intensities.push(p.intensity);
            contextMap[context].moods.push(p.mood);
        });

        // Find contexts that appear frequently
        return Object.entries(contextMap)
            .filter(([_, data]) => data.count >= 3)
            .map(([context, data]) => ({
                context,
                frequency: data.count,
                avgIntensity: (data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length).toFixed(2),
                commonMoods: [...new Set(data.moods)].slice(0, 3)
            }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5);
    }

    /**
     * Compare current state to historical data with narrative
     */
    async compareToHistory(userId, timeframe = 30) {
        try {
            const profile = await CognitiveProfile.findOne({ userId });
            if (!profile) {
                throw new Error('Profile not found');
            }

            const currentPatterns = profile.getEmotionalTrajectory(7);
            const historicalPatterns = profile.getEmotionalTrajectory(timeframe);

            if (currentPatterns.length === 0 || historicalPatterns.length < 14) {
                return {
                    comparison: 'insufficient_data',
                    message: 'Not enough data for meaningful comparison yet',
                    suggestion: 'Continue your wellness journey to build insights'
                };
            }

            const currentAvg = currentPatterns.reduce((sum, p) => sum + p.intensity, 0) / currentPatterns.length;
            const historicalAvg = historicalPatterns.reduce((sum, p) => sum + p.intensity, 0) / historicalPatterns.length;

            const improvement = ((historicalAvg - currentAvg) / historicalAvg * 100);
            const improvementAbs = Math.abs(improvement);

            // Generate narrative comparison
            let narrative = '';
            let comparison = 'stable';
            let encouragement = '';

            if (improvement > 15) {
                comparison = 'significant_improvement';
                narrative = `Over the past ${timeframe} days, you've shown remarkable progress. Your emotional intensity has decreased by ${improvementAbs.toFixed(1)}%, indicating improved emotional regulation and resilience.`;
                encouragement = 'This is a testament to your commitment to growth. Keep nurturing these positive changes.';
            } else if (improvement > 5) {
                comparison = 'improving';
                narrative = `Compared to the past ${timeframe} days, you're showing steady improvement with a ${improvementAbs.toFixed(1)}% decrease in emotional intensity. Small, consistent progress adds up.`;
                encouragement = 'You\'re moving in the right direction. Trust the process.';
            } else if (improvement < -15) {
                comparison = 'needs_attention';
                narrative = `Your emotional intensity has increased by ${improvementAbs.toFixed(1)}% over the past ${timeframe} days. This might indicate you\'re facing new challenges or stressors.`;
                encouragement = 'Remember, setbacks are part of growth. Consider reaching out for additional support if needed.';
            } else if (improvement < -5) {
                comparison = 'declining';
                narrative = `There's been a ${improvementAbs.toFixed(1)}% increase in emotional intensity recently. It's okay to have difficult periods.`;
                encouragement = 'Focus on your coping strategies and self-care. You\'ve overcome challenges before.';
            } else {
                comparison = 'stable';
                narrative = `Your emotional patterns have remained relatively stable over the past ${timeframe} days, with only a ${improvementAbs.toFixed(1)}% variation.`;
                encouragement = 'Consistency is valuable. Continue with what\'s working for you.';
            }

            // Identify specific improvements
            const improvements = [];
            const concerns = [];

            // Compare dominant emotions
            const currentMoods = {};
            const historicalMoods = {};
            
            currentPatterns.forEach(p => currentMoods[p.mood] = (currentMoods[p.mood] || 0) + 1);
            historicalPatterns.forEach(p => historicalMoods[p.mood] = (historicalMoods[p.mood] || 0) + 1);

            const positiveEmotions = ['calm', 'hopeful', 'content', 'happy', 'relieved'];
            const challengingEmotions = ['anxious', 'sad', 'stressed', 'overwhelmed', 'angry', 'fearful'];

            positiveEmotions.forEach(emotion => {
                const currentCount = currentMoods[emotion] || 0;
                const historicalCount = historicalMoods[emotion] || 0;
                if (currentCount > historicalCount) {
                    improvements.push(`More ${emotion} moments recently`);
                }
            });

            challengingEmotions.forEach(emotion => {
                const currentCount = currentMoods[emotion] || 0;
                const historicalCount = historicalMoods[emotion] || 0;
                if (currentCount > historicalCount * 1.5) {
                    concerns.push(`Increased ${emotion} feelings`);
                }
            });

            return {
                comparison,
                improvement_percentage: improvement.toFixed(1),
                narrative,
                encouragement,
                current_average: currentAvg.toFixed(2),
                historical_average: historicalAvg.toFixed(2),
                timeframe: `${timeframe} days`,
                improvements: improvements.slice(0, 3),
                concerns: concerns.slice(0, 3),
                data_quality: {
                    current_points: currentPatterns.length,
                    historical_points: historicalPatterns.length,
                    confidence: historicalPatterns.length >= 30 ? 'high' : 'moderate'
                }
            };
        } catch (error) {
            console.error('History comparison error:', error);
            throw error;
        }
    }

    /**
     * Add memory anchor (key moment to reference in future)
     */
    async addMemoryAnchor(userId, moment, context, emotionalSignificance = 0.8) {
        try {
            const profile = await CognitiveProfile.findOne({ userId });
            if (!profile) {
                throw new Error('Profile not found');
            }

            // Initialize memory_anchors if not exists
            if (!profile.memory_anchors) {
                profile.memory_anchors = [];
            }

            profile.memory_anchors.push({
                moment,
                date: new Date(),
                emotional_significance: emotionalSignificance,
                context,
                referenced_count: 0
            });

            // Keep only top 20 most significant anchors
            if (profile.memory_anchors.length > 20) {
                profile.memory_anchors.sort((a, b) => b.emotional_significance - a.emotional_significance);
                profile.memory_anchors = profile.memory_anchors.slice(0, 20);
            }

            await profile.save();

            return {
                success: true,
                anchor: profile.memory_anchors[profile.memory_anchors.length - 1],
                total_anchors: profile.memory_anchors.length
            };
        } catch (error) {
            console.error('Memory anchor error:', error);
            throw error;
        }
    }

    /**
     * Get relevant memory anchors for current context
     */
    async getRelevantMemories(userId, currentEmotion, limit = 3) {
        try {
            const profile = await CognitiveProfile.findOne({ userId });
            if (!profile || !profile.memory_anchors || profile.memory_anchors.length === 0) {
                return [];
            }

            // Sort by emotional significance and recency
            const sortedAnchors = profile.memory_anchors
                .map(anchor => ({
                    ...anchor,
                    relevanceScore: anchor.emotional_significance * 0.7 + 
                                  (1 - (Date.now() - anchor.date.getTime()) / (90 * 24 * 60 * 60 * 1000)) * 0.3
                }))
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, limit);

            return sortedAnchors.map(anchor => ({
                moment: anchor.moment,
                date: anchor.date,
                context: anchor.context,
                timeSince: this.getTimeSince(anchor.date)
            }));
        } catch (error) {
            console.error('Get memories error:', error);
            return [];
        }
    }

    /**
     * Helper: Get human-readable time since
     */
    getTimeSince(date) {
        const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'today';
        if (days === 1) return 'yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return `${Math.floor(days / 30)} months ago`;
    }
}

module.exports = new NarrativeEngine();
