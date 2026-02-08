/**
 * Profile Intelligence Service
 * Advanced analysis of user cognitive profiles
 * Provides insights, growth tracking, and pattern detection
 */

const CognitiveProfile = require('../models/CognitiveProfile');
const Session = require('../models/Session');
const geminiService = require('./geminiService');

class ProfileIntelligence {
    /**
     * Get comprehensive profile insights
     */
    async getProfileInsights(userId) {
        try {
            const profile = await CognitiveProfile.findOne({ userId });
            if (!profile) {
                throw new Error('Profile not found');
            }

            const [
                emotionalPatterns,
                triggerAnalysis,
                interventionEffectiveness,
                growthMetrics,
                concernsAnalysis
            ] = await Promise.all([
                this.analyzeEmotionalPatterns(profile),
                this.analyzeTriggers(profile),
                this.analyzeInterventions(profile),
                this.analyzeGrowth(profile),
                this.analyzeConcerns(profile)
            ]);

            return {
                userId,
                baseline: {
                    mood: profile.baseline_mood,
                    lastUpdated: profile.updatedAt
                },
                emotional: emotionalPatterns,
                triggers: triggerAnalysis,
                interventions: interventionEffectiveness,
                growth: growthMetrics,
                concerns: concernsAnalysis,
                stats: profile.stats,
                generatedAt: new Date()
            };
        } catch (error) {
            console.error('Profile insights error:', error);
            throw error;
        }
    }

    /**
     * Analyze emotional patterns
     */
    async analyzeEmotionalPatterns(profile) {
        const recentPatterns = profile.getEmotionalTrajectory(30);
        
        if (recentPatterns.length === 0) {
            return {
                dominant_emotion: 'neutral',
                average_intensity: 0.5,
                trajectory: 'stable',
                volatility: 0,
                patterns: []
            };
        }

        // Calculate statistics
        const emotionCounts = {};
        let totalIntensity = 0;
        const intensities = [];

        recentPatterns.forEach(p => {
            emotionCounts[p.mood] = (emotionCounts[p.mood] || 0) + 1;
            totalIntensity += p.intensity;
            intensities.push(p.intensity);
        });

        // Dominant emotion
        const dominant = Object.entries(emotionCounts)
            .sort((a, b) => b[1] - a[1])[0];

        // Calculate volatility (standard deviation of intensity)
        const avgIntensity = totalIntensity / recentPatterns.length;
        const variance = intensities.reduce((sum, i) => sum + Math.pow(i - avgIntensity, 2), 0) / intensities.length;
        const volatility = Math.sqrt(variance);

        // Detect trajectory
        const firstWeek = recentPatterns.slice(0, 7);
        const lastWeek = recentPatterns.slice(-7);
        const firstAvg = firstWeek.reduce((sum, p) => sum + p.intensity, 0) / firstWeek.length;
        const lastAvg = lastWeek.reduce((sum, p) => sum + p.intensity, 0) / lastWeek.length;

        let trajectory = 'stable';
        if (lastAvg < firstAvg - 0.15) trajectory = 'improving';
        else if (lastAvg > firstAvg + 0.15) trajectory = 'declining';
        else if (volatility > 0.3) trajectory = 'fluctuating';

        return {
            dominant_emotion: dominant ? dominant[0] : 'neutral',
            dominant_percentage: dominant ? (dominant[1] / recentPatterns.length * 100).toFixed(1) : 0,
            average_intensity: avgIntensity.toFixed(2),
            trajectory,
            volatility: volatility.toFixed(2),
            total_data_points: recentPatterns.length,
            emotion_distribution: emotionCounts
        };
    }

    /**
     * Analyze triggers
     */
    async analyzeTriggers(profile) {
        const triggers = profile.triggers || [];
        
        if (triggers.length === 0) {
            return {
                total: 0,
                high_severity: [],
                frequent: [],
                recommendations: []
            };
        }

        const highSeverity = triggers.filter(t => t.severity >= 7);
        const frequent = triggers.filter(t => ['frequent', 'constant'].includes(t.frequency));

        return {
            total: triggers.length,
            high_severity: highSeverity.map(t => ({
                trigger: t.trigger,
                severity: t.severity,
                frequency: t.frequency
            })),
            frequent: frequent.map(t => t.trigger),
            recommendations: this.getTriggerRecommendations(highSeverity)
        };
    }

    /**
     * Get trigger management recommendations
     */
    getTriggerRecommendations(highSeverityTriggers) {
        if (highSeverityTriggers.length === 0) return [];

        const recommendations = [];
        highSeverityTriggers.forEach(trigger => {
            if (trigger.trigger.toLowerCase().includes('work')) {
                recommendations.push('Consider work-life balance strategies');
            } else if (trigger.trigger.toLowerCase().includes('social')) {
                recommendations.push('Explore social anxiety coping techniques');
            } else if (trigger.trigger.toLowerCase().includes('family')) {
                recommendations.push('Family relationship support may be helpful');
            }
        });

        return [...new Set(recommendations)]; // Remove duplicates
    }

    /**
     * Analyze intervention effectiveness
     */
    async analyzeInterventions(profile) {
        const interventions = profile.effective_interventions || [];
        
        if (interventions.length === 0) {
            return {
                total: 0,
                most_effective: [],
                least_effective: [],
                recommendations: []
            };
        }

        const sorted = [...interventions].sort((a, b) => b.success_rate - a.success_rate);
        const mostEffective = sorted.slice(0, 3).filter(i => i.success_rate >= 0.7);
        const leastEffective = sorted.slice(-3).filter(i => i.success_rate < 0.5);

        return {
            total: interventions.length,
            most_effective: mostEffective.map(i => ({
                intervention: i.intervention,
                success_rate: (i.success_rate * 100).toFixed(0) + '%',
                times_used: i.times_used
            })),
            least_effective: leastEffective.map(i => i.intervention),
            average_success_rate: (interventions.reduce((sum, i) => sum + i.success_rate, 0) / interventions.length * 100).toFixed(0) + '%'
        };
    }

    /**
     * Analyze growth and progress
     */
    async analyzeGrowth(profile) {
        const sessions = await Session.find({ 
            userId: profile.userId, 
            status: 'completed' 
        }).sort({ endTime: -1 }).limit(10);

        if (sessions.length === 0) {
            return {
                total_sessions: 0,
                recent_quality: 0,
                improvement_trend: 'insufficient_data'
            };
        }

        const qualityScores = sessions
            .filter(s => s.summary?.quality_score)
            .map(s => s.summary.quality_score);

        const avgQuality = qualityScores.length > 0
            ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
            : 0;

        // Compare first half vs second half
        const firstHalf = qualityScores.slice(0, Math.floor(qualityScores.length / 2));
        const secondHalf = qualityScores.slice(Math.floor(qualityScores.length / 2));

        const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
        const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;

        let trend = 'stable';
        if (secondAvg > firstAvg + 1) trend = 'improving';
        else if (secondAvg < firstAvg - 1) trend = 'declining';

        return {
            total_sessions: profile.stats.total_sessions,
            recent_sessions: sessions.length,
            average_quality: avgQuality.toFixed(1),
            improvement_trend: trend,
            milestones: profile.life_narrative?.growth_milestones?.length || 0
        };
    }

    /**
     * Analyze concerns
     */
    async analyzeConcerns(profile) {
        const concerns = profile.primary_concerns || [];
        
        if (concerns.length === 0) {
            return {
                total: 0,
                active: [],
                improving: [],
                recurring: []
            };
        }

        const active = concerns.filter(c => c.status === 'active');
        const improving = concerns.filter(c => c.status === 'improving');
        const recurring = concerns.filter(c => c.status === 'recurring');

        return {
            total: concerns.length,
            active: active.map(c => ({
                concern: c.concern,
                severity: c.severity,
                times_discussed: c.times_discussed
            })),
            improving: improving.map(c => c.concern),
            recurring: recurring.map(c => c.concern),
            needs_attention: active.filter(c => c.severity >= 7).length
        };
    }

    /**
     * Compare current state to historical data
     */
    async compareToHistory(userId, timeframe = 30) {
        try {
            const profile = await CognitiveProfile.findOne({ userId });
            if (!profile) return null;

            const currentPatterns = profile.getEmotionalTrajectory(7);
            const historicalPatterns = profile.getEmotionalTrajectory(timeframe);

            if (currentPatterns.length === 0 || historicalPatterns.length < 14) {
                return {
                    comparison: 'insufficient_data',
                    message: 'Not enough data for comparison yet'
                };
            }

            const currentAvg = currentPatterns.reduce((sum, p) => sum + p.intensity, 0) / currentPatterns.length;
            const historicalAvg = historicalPatterns.reduce((sum, p) => sum + p.intensity, 0) / historicalPatterns.length;

            const improvement = ((historicalAvg - currentAvg) / historicalAvg * 100).toFixed(1);

            let message = '';
            if (improvement > 10) {
                message = `Compared to the past ${timeframe} days, you're showing ${improvement}% improvement in emotional regulation.`;
            } else if (improvement < -10) {
                message = `Your emotional intensity has increased by ${Math.abs(improvement)}% compared to the past ${timeframe} days. Let's explore what's changed.`;
            } else {
                message = `Your emotional patterns have remained relatively stable over the past ${timeframe} days.`;
            }

            return {
                comparison: improvement > 10 ? 'improving' : improvement < -10 ? 'declining' : 'stable',
                improvement_percentage: improvement,
                message,
                current_average: currentAvg.toFixed(2),
                historical_average: historicalAvg.toFixed(2)
            };
        } catch (error) {
            console.error('History comparison error:', error);
            return null;
        }
    }

    /**
     * Detect recurring emotional cycles
     */
    async detectRecurringPatterns(userId) {
        try {
            const profile = await CognitiveProfile.findOne({ userId });
            if (!profile) return null;

            const patterns = profile.getEmotionalTrajectory(60);
            if (patterns.length < 20) {
                return { patterns: [], message: 'Not enough data to detect patterns' };
            }

            // Group by day of week
            const dayPatterns = {};
            patterns.forEach(p => {
                const day = new Date(p.date).getDay();
                if (!dayPatterns[day]) dayPatterns[day] = [];
                dayPatterns[day].push(p.intensity);
            });

            // Find days with consistently high/low intensity
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const insights = [];

            Object.entries(dayPatterns).forEach(([day, intensities]) => {
                if (intensities.length < 3) return;
                const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length;
                if (avg > 0.7) {
                    insights.push(`${dayNames[day]}s tend to be more challenging for you`);
                } else if (avg < 0.3) {
                    insights.push(`${dayNames[day]}s are typically better days for you`);
                }
            });

            return {
                patterns: insights,
                message: insights.length > 0 ? 'Detected weekly patterns in your emotional state' : 'No clear weekly patterns detected'
            };
        } catch (error) {
            console.error('Pattern detection error:', error);
            return null;
        }
    }
}

module.exports = new ProfileIntelligence();
