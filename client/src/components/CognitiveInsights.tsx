/**
 * CognitiveInsights Component - Displays user's Cognitive Digital Twin data
 * Shows emotional patterns, triggers, effective interventions, and wellness trajectory
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    Sparkles,
    Target,
    Heart,
    Activity,
    Loader2,
    ChevronRight,
    Zap
} from 'lucide-react';
import { api } from '@/utils/api';

interface EmotionalPattern {
    date: string;
    mood: string;
    intensity: number;
    context?: string;
}

interface Trigger {
    trigger: string;
    severity: number;
    frequency: string;
}

interface Intervention {
    intervention: string;
    success_rate: number;
    times_used: number;
}

interface Goal {
    goal: string;
    priority: number;
    status: string;
}

interface WellnessTrajectory {
    current_trend: 'improving' | 'stable' | 'declining' | 'fluctuating';
    burnout_risk: number;
    predicted_mood_next_week?: string;
    warning_signs_active: string[];
}

interface CognitiveProfile {
    baseline_mood: string;
    triggers: Trigger[];
    effective_interventions: Intervention[];
    goals: Goal[];
    primary_concerns: Array<{ concern: string; severity: number; status: string }>;
    emotional_trajectory: EmotionalPattern[];
    wellness_trajectory: WellnessTrajectory;
    stats: {
        total_sessions: number;
        total_messages: number;
        average_session_length: number;
        crisis_interventions: number;
        positive_sessions_percentage: number;
    };
    last_interaction: string;
}

interface CognitiveInsightsProps {
    userId?: string;
    compact?: boolean;
}

// Mood emoji mapping
const moodEmojis: Record<string, string> = {
    anxious: '😰',
    sad: '😢',
    calm: '😌',
    stressed: '😫',
    overwhelmed: '😵',
    hopeful: '🌟',
    angry: '😠',
    neutral: '😐',
    confused: '😕',
    relieved: '😮‍💨',
    happy: '😊',
    very_positive: '🌟',
    positive: '😊',
    negative: '😔',
    very_negative: '😢',
};

// Mood color mapping
const moodColors: Record<string, string> = {
    anxious: 'text-amber-400 bg-amber-500/20',
    sad: 'text-blue-400 bg-blue-500/20',
    calm: 'text-green-400 bg-green-500/20',
    stressed: 'text-orange-400 bg-orange-500/20',
    overwhelmed: 'text-red-400 bg-red-500/20',
    hopeful: 'text-emerald-400 bg-emerald-500/20',
    angry: 'text-red-500 bg-red-500/20',
    neutral: 'text-gray-400 bg-gray-500/20',
    confused: 'text-purple-400 bg-purple-500/20',
    relieved: 'text-teal-400 bg-teal-500/20',
    happy: 'text-yellow-400 bg-yellow-500/20',
    very_positive: 'text-emerald-400 bg-emerald-500/20',
    positive: 'text-green-400 bg-green-500/20',
    negative: 'text-orange-400 bg-orange-500/20',
    very_negative: 'text-red-400 bg-red-500/20',
};

export default function CognitiveInsights({ userId, compact = false }: CognitiveInsightsProps) {
    const [profile, setProfile] = useState<CognitiveProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get(`/profile/${userId}`);
            if (data.success) {
                setProfile(data.profile);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Unable to load insights');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Start chatting to build your wellness profile</p>
            </div>
        );
    }

    // Compact widget for dashboard
    if (compact) {
        return (
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">Wellness Insights</span>
                    </div>
                    <TrendIndicator trend={profile.wellness_trajectory?.current_trend} />
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white/5 rounded-lg">
                        <p className="text-lg font-bold text-primary">{profile.stats.total_sessions}</p>
                        <p className="text-[10px] text-muted-foreground">Sessions</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg">
                        <p className="text-lg font-bold">{profile.effective_interventions.length}</p>
                        <p className="text-[10px] text-muted-foreground">Helpful Tools</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg">
                        <p className="text-lg font-bold">{profile.goals.length}</p>
                        <p className="text-[10px] text-muted-foreground">Goals</p>
                    </div>
                </div>

                {/* Burnout risk indicator */}
                {profile.wellness_trajectory?.burnout_risk > 0.5 && (
                    <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span className="text-xs">Take time for self-care today</span>
                    </div>
                )}
            </div>
        );
    }

    // Full view
    return (
        <div className="space-y-4">
            {/* Wellness Trajectory Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold">Wellness Trajectory</h3>
                            <p className="text-xs text-muted-foreground">Based on your recent interactions</p>
                        </div>
                    </div>
                    <TrendIndicator trend={profile.wellness_trajectory?.current_trend} size="lg" />
                </div>

                {/* Burnout Risk Gauge */}
                <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span>Energy Level</span>
                        <span className="text-muted-foreground">
                            {Math.round((1 - (profile.wellness_trajectory?.burnout_risk || 0)) * 100)}%
                        </span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full">
                        <motion.div
                            className={`h-full rounded-full ${(profile.wellness_trajectory?.burnout_risk || 0) > 0.7
                                    ? 'bg-red-500'
                                    : (profile.wellness_trajectory?.burnout_risk || 0) > 0.4
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(1 - (profile.wellness_trajectory?.burnout_risk || 0)) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Warning signs */}
                {profile.wellness_trajectory?.warning_signs_active && profile.wellness_trajectory.warning_signs_active.length > 0 && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-xs font-medium text-amber-400 mb-1">⚠️ Watch for:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            {profile.wellness_trajectory.warning_signs_active.map((sign, idx) => (
                                <li key={idx}>• {sign}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </motion.div>

            {/* Emotional Pattern */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-bold">Emotional Pattern</h3>
                        <p className="text-xs text-muted-foreground">Your recent emotional states</p>
                    </div>
                </div>

                {/* Baseline mood */}
                <div className="mb-4 p-3 bg-white/5 rounded-lg flex items-center justify-between">
                    <span className="text-sm">Baseline Mood</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${moodColors[profile.baseline_mood] || 'bg-gray-500/20'}`}>
                        {moodEmojis[profile.baseline_mood]} {profile.baseline_mood?.replace('_', ' ')}
                    </span>
                </div>

                {/* Recent emotions */}
                {profile.emotional_trajectory && profile.emotional_trajectory.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Recent Patterns</p>
                        <div className="flex flex-wrap gap-2">
                            {profile.emotional_trajectory.slice(0, 10).map((pattern, idx) => (
                                <div
                                    key={idx}
                                    className={`px-2 py-1 rounded-full text-xs ${moodColors[pattern.mood] || 'bg-gray-500/20'}`}
                                    title={pattern.context || ''}
                                >
                                    {moodEmojis[pattern.mood]} {pattern.mood}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Effective Interventions */}
            {profile.effective_interventions && profile.effective_interventions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-bold">What Works for You</h3>
                            <p className="text-xs text-muted-foreground">Interventions that have helped</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {profile.effective_interventions.map((intervention, idx) => (
                            <div
                                key={idx}
                                className="p-3 bg-white/5 rounded-lg flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{intervention.intervention}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Used {intervention.times_used}x
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-emerald-400">
                                        {Math.round(intervention.success_rate * 100)}%
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">effective</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Known Triggers */}
            {profile.triggers && profile.triggers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-bold">Known Triggers</h3>
                            <p className="text-xs text-muted-foreground">Things that may affect your mood</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {profile.triggers.map((trigger, idx) => (
                            <div
                                key={idx}
                                className={`px-3 py-1.5 rounded-full text-xs border ${trigger.severity > 7
                                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                        : trigger.severity > 5
                                            ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                    }`}
                            >
                                {trigger.trigger}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Active Goals */}
            {profile.goals && profile.goals.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-bold">Your Goals</h3>
                            <p className="text-xs text-muted-foreground">What you're working towards</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {profile.goals.map((goal, idx) => (
                            <div
                                key={idx}
                                className="p-3 bg-white/5 rounded-lg flex items-center gap-3"
                            >
                                <div className={`w-2 h-2 rounded-full ${goal.priority <= 2 ? 'bg-red-400' :
                                        goal.priority <= 3 ? 'bg-amber-400' :
                                            'bg-blue-400'
                                    }`} />
                                <span className="flex-1 text-sm">{goal.goal}</span>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
                <h3 className="font-bold mb-4">Your Journey</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{profile.stats.total_sessions}</p>
                        <p className="text-xs text-muted-foreground">Total Sessions</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                        <p className="text-2xl font-bold">{profile.stats.total_messages}</p>
                        <p className="text-xs text-muted-foreground">Messages</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                        <p className="text-2xl font-bold text-emerald-400">
                            {profile.stats.positive_sessions_percentage}%
                        </p>
                        <p className="text-xs text-muted-foreground">Positive Sessions</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg text-center">
                        <p className="text-2xl font-bold text-amber-400">
                            {Math.round(profile.stats.average_session_length / 60)}m
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Session</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Trend indicator component
function TrendIndicator({ trend, size = 'sm' }: { trend?: string; size?: 'sm' | 'lg' }) {
    const iconSize = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

    const trendConfig = {
        improving: { icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/20', label: 'Improving' },
        stable: { icon: Minus, color: 'text-blue-400 bg-blue-500/20', label: 'Stable' },
        declining: { icon: TrendingDown, color: 'text-amber-400 bg-amber-500/20', label: 'Needs attention' },
        fluctuating: { icon: Activity, color: 'text-purple-400 bg-purple-500/20', label: 'Fluctuating' },
    };

    const config = trendConfig[trend as keyof typeof trendConfig] || trendConfig.stable;
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.color}`}>
            <Icon className={iconSize} />
            {size === 'lg' && <span className="text-xs font-medium">{config.label}</span>}
        </div>
    );
}
