/**
 * Demo Data Provider
 * Provides realistic dummy data for dashboard components when API is unavailable
 */

// Generate mock emotion data for the timeline
export function generateEmotionData(days: number = 30) {
    const moods = ['calm', 'anxious', 'hopeful', 'stressed', 'content', 'happy', 'neutral', 'sad'];
    const data = [];

    for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000);
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const intensity = Math.random() * 0.6 + 0.2; // Between 0.2 and 0.8

        data.push({
            date,
            mood,
            intensity,
            context: i % 5 === 0 ? 'Morning reflection' : undefined,
            source: 'ai_detected'
        });
    }

    return data;
}

// Generate mock session history
export function generateSessionHistory(limit: number = 5) {
    const sessionTypes = ['chat', 'video'];
    const moods = ['anxious', 'calm', 'hopeful', 'stressed', 'neutral'];
    const trajectories = ['improving', 'stable', 'declining', 'fluctuating'] as const;
    const themes = [
        'Work-life balance', 'Anxiety management', 'Sleep hygiene',
        'Relationship dynamics', 'Self-care routines', 'Goal setting',
        'Mindfulness practice', 'Stress reduction', 'Personal growth'
    ];

    const sessions = [];

    for (let i = 0; i < limit; i++) {
        const startDate = new Date(Date.now() - (i * 2 + 1) * 24 * 60 * 60 * 1000);
        const duration = Math.floor(Math.random() * 1800) + 300; // 5-35 minutes

        sessions.push({
            _id: `session_${i}`,
            type: sessionTypes[Math.floor(Math.random() * sessionTypes.length)],
            status: 'completed',
            startTime: startDate.toISOString(),
            endTime: new Date(startDate.getTime() + duration * 1000).toISOString(),
            duration,
            summary: {
                overview: `Explored topics around ${themes[i % themes.length].toLowerCase()} and discussed coping strategies.`,
                emotional_journey: 'Started with some tension, gradually found clarity and calm.',
                key_themes: [themes[i % themes.length], themes[(i + 1) % themes.length]],
                breakthroughs: i % 2 === 0 ? ['Identified a new coping mechanism'] : undefined,
                concerns: i % 3 === 0 ? ['Monitor stress levels'] : undefined,
                recommended_focus_next: 'Continue practicing mindfulness techniques',
                mood_at_start: moods[Math.floor(Math.random() * moods.length)],
                mood_at_end: 'calm',
                quality_score: Math.floor(Math.random() * 2) + 4 // 4-5 stars
            },
            emotionMetrics: {
                dominant_emotion: moods[Math.floor(Math.random() * moods.length)],
                average_intensity: Math.random() * 0.5 + 0.3,
                trajectory: trajectories[Math.floor(Math.random() * trajectories.length)]
            }
        });
    }

    return {
        sessions,
        stats: {
            total_sessions: 24,
            total_duration: 12600, // ~210 minutes
            average_duration: 525, // ~8.75 minutes
            average_quality: 4.2
        }
    };
}

// Generate mock cognitive profile
export function generateCognitiveProfile() {
    return {
        baseline_mood: 'calm',
        triggers: [
            { trigger: 'Work deadlines', severity: 7, frequency: 'often' },
            { trigger: 'Poor sleep', severity: 6, frequency: 'sometimes' },
            { trigger: 'Social situations', severity: 5, frequency: 'rarely' }
        ],
        effective_interventions: [
            { intervention: 'Deep breathing', success_rate: 0.85, times_used: 12 },
            { intervention: 'Mindful walking', success_rate: 0.78, times_used: 8 },
            { intervention: 'Journaling', success_rate: 0.72, times_used: 15 },
            { intervention: 'Progressive relaxation', success_rate: 0.68, times_used: 6 }
        ],
        goals: [
            { goal: 'Practice daily mindfulness', priority: 1, status: 'active' },
            { goal: 'Improve sleep routine', priority: 2, status: 'active' },
            { goal: 'Build exercise habit', priority: 3, status: 'active' }
        ],
        primary_concerns: [
            { concern: 'Work stress', severity: 6, status: 'monitoring' },
            { concern: 'Sleep quality', severity: 5, status: 'improving' }
        ],
        emotional_trajectory: generateEmotionData(14),
        wellness_trajectory: {
            current_trend: 'improving' as const,
            burnout_risk: 0.35,
            predicted_mood_next_week: 'calm',
            warning_signs_active: []
        },
        stats: {
            total_sessions: 24,
            total_messages: 342,
            average_session_length: 480,
            crisis_interventions: 0,
            positive_sessions_percentage: 72
        },
        last_interaction: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    };
}

// Generate mock wellness plan
export function generateWellnessPlan() {
    const today = new Date();
    const days = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        const completed = i < 3; // First 3 days completed

        days.push({
            day: i + 1,
            date: date.toISOString(),
            theme: ['Mindfulness', 'Movement', 'Rest', 'Connection', 'Creativity', 'Nature', 'Reflection'][i],
            morning: {
                activity: '5-minute breathing exercise',
                duration: '5 min',
                instructions: 'Find a quiet space and focus on slow, deep breaths',
                completed: completed,
                completed_at: completed ? new Date().toISOString() : undefined
            },
            afternoon: {
                activity: '10-minute walk',
                duration: '10 min',
                instructions: 'Step away from work and take a mindful walk',
                completed: i < 2,
                completed_at: i < 2 ? new Date().toISOString() : undefined
            },
            evening: {
                activity: 'Gratitude journaling',
                duration: '5 min',
                instructions: 'Write 3 things you\'re grateful for today',
                completed: i < 2,
                completed_at: i < 2 ? new Date().toISOString() : undefined
            },
            journal_prompt: 'What moment brought you peace today?',
            journal_entry: i < 2 ? 'Found calm during my morning meditation.' : undefined,
            completed: i < 2,
            completion_percentage: i < 2 ? 100 : i === 2 ? 33 : 0
        });
    }

    return {
        _id: 'demo_plan_001',
        plan_name: 'Mindful Week',
        description: 'A 7-day journey to cultivate inner peace and balance',
        duration_days: 7,
        daily_time_commitment: '20 minutes',
        days,
        weekly_goal: 'Complete at least 5 morning activities',
        reward_suggestion: 'Treat yourself to a relaxing bath or favorite snack',
        tips: [
            'Start each day with intention',
            'Be patient with yourself',
            'Celebrate small wins'
        ],
        progress: {
            current_day: 3,
            days_completed: 2,
            activities_completed: 9,
            total_activities: 21,
            completion_percentage: 43,
            streak_days: 3,
            longest_streak: 3
        },
        status: 'active' as const
    };
}

// Generate wellness trajectory data
export function generateWellnessTrajectory() {
    return {
        trajectory: {
            trend: 'improving' as const,
            burnout_risk: 0.3,
            predicted_mood_7_days: 'hopeful',
            warning_signs: []
        },
        narrative: {
            comparison: 'improving',
            improvement_percentage: '12.5',
            narrative: 'Your emotional patterns show positive progress over the past 30 days. You\'ve been more consistent with your wellness practices.',
            encouragement: 'Keep nurturing these positive changes. Your consistency is paying off.',
            improvements: ['More calm moments', 'Better stress management', 'Improved sleep quality'],
            concerns: []
        }
    };
}

// Check if we should use demo mode
export function isDemoMode(): boolean {
    // Use demo mode if no userId or in development without API
    return true; // Always use demo mode for now until API is stable
}
