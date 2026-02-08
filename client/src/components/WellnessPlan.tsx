/**
 * WellnessPlan Component - Displays and manages AI-generated wellness plans
 * Features: Plan generation, activity tracking, journal entries, progress visualization
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Calendar,
    Check,
    Play,
    Pause,
    ChevronDown,
    ChevronUp,
    BookOpen,
    Sun,
    Sunset,
    Moon,
    Trophy,
    Flame,
    RefreshCw,
    Loader2,
    Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/utils/api';

interface Activity {
    activity: string;
    duration: string;
    instructions: string;
    completed: boolean;
    completed_at?: string;
    user_notes?: string;
    effectiveness_rating?: number;
}

interface PlanDay {
    day: number;
    date?: string;
    theme: string;
    morning: Activity;
    afternoon: Activity;
    evening: Activity;
    journal_prompt: string;
    journal_entry?: string;
    completed: boolean;
    completion_percentage: number;
    mood_of_day?: string;
}

interface WellnessPlan {
    _id: string;
    plan_name: string;
    description: string;
    duration_days: number;
    daily_time_commitment: string;
    days: PlanDay[];
    weekly_goal: string;
    reward_suggestion: string;
    tips: string[];
    progress: {
        current_day: number;
        days_completed: number;
        activities_completed: number;
        total_activities: number;
        completion_percentage: number;
        streak_days: number;
        longest_streak: number;
    };
    status: 'active' | 'completed' | 'paused' | 'abandoned';
}

interface WellnessPlanWidgetProps {
    userId?: string;
    compact?: boolean;
}

export default function WellnessPlanWidget({ userId, compact = false }: WellnessPlanWidgetProps) {
    const [plan, setPlan] = useState<WellnessPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [expandedDay, setExpandedDay] = useState<number | null>(null);
    const [journalText, setJournalText] = useState('');
    const [generationGoals, setGenerationGoals] = useState('');
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    // Fetch active plan
    useEffect(() => {
        if (userId) {
            fetchPlan();
        } else {
            setLoading(false);
        }
    }, [userId]);

    const fetchPlan = async () => {
        try {
            const { data } = await api.get(`/wellness-plan/${userId}`);
            if (data.success && data.plan) {
                setPlan(data.plan);
                // Auto-expand current day
                const today = new Date().toDateString();
                const todayDay = data.plan.days.find((d: PlanDay) =>
                    d.date && new Date(d.date).toDateString() === today
                );
                if (todayDay) {
                    setExpandedDay(todayDay.day);
                }
            }
        } catch (error) {
            console.error('Error fetching wellness plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const generatePlan = async () => {
        if (!userId) return;

        setGenerating(true);
        try {
            // First generate the plan
            const { data: generatedData } = await api.post('/chatbot/wellness-plan/generate', {
                userId,
                duration: 7,
                goals: generationGoals ? [generationGoals] : undefined
            });

            if (generatedData.plan) {
                // Then save it
                const { data: savedData } = await api.post(`/wellness-plan/${userId}/save`, {
                    plan: generatedData.plan
                });

                if (savedData.success && savedData.plan) {
                    setPlan(savedData.plan);
                    setShowGenerateModal(false);
                    setGenerationGoals('');
                }
            }
        } catch (error) {
            console.error('Error generating wellness plan:', error);
        } finally {
            setGenerating(false);
        }
    };

    const completeActivity = async (day: number, period: 'morning' | 'afternoon' | 'evening') => {
        if (!plan) return;

        try {
            const { data } = await api.post(`/wellness-plan/${plan._id}/complete-activity`, {
                day,
                period,
                rating: 4
            });

            if (data.success) {
                setPlan(data.plan);
            }
        } catch (error) {
            console.error('Error completing activity:', error);
        }
    };

    const saveJournalEntry = async (day: number) => {
        if (!plan || !journalText.trim()) return;

        try {
            const { data } = await api.post(`/wellness-plan/${plan._id}/journal`, {
                day,
                entry: journalText
            });

            if (data.success) {
                setPlan(data.plan);
                setJournalText('');
            }
        } catch (error) {
            console.error('Error saving journal entry:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    // Generate Plan Modal
    if (showGenerateModal) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card/80 backdrop-blur-md rounded-xl p-6 border border-primary/30"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Generate Your Wellness Plan</h3>
                        <p className="text-sm text-muted-foreground">AI will create a personalized 7-day plan</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-2">
                            What would you like to focus on? (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Reduce anxiety, Better sleep, More energy..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={generationGoals}
                            onChange={(e) => setGenerationGoals(e.target.value)}
                            disabled={generating}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowGenerateModal(false)}
                            disabled={generating}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 gap-2"
                            onClick={generatePlan}
                            disabled={generating}
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Generate Plan
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // No plan - show create option
    if (!plan) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-primary/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-6 border border-primary/20"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <Target className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">Start Your Wellness Journey</h3>
                        <p className="text-sm text-muted-foreground">
                            Let AI create a personalized wellness plan just for you
                        </p>
                    </div>
                    <Button
                        className="gap-2"
                        onClick={() => setShowGenerateModal(true)}
                    >
                        <Sparkles className="w-4 h-4" />
                        Generate My Plan
                    </Button>
                </div>
            </motion.div>
        );
    }

    // Compact view for dashboard widget
    if (compact) {
        return (
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">{plan.plan_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        Day {plan.progress.current_day}/{plan.duration_days}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-white/10 rounded-full mb-3">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${plan.progress.completion_percentage}%` }}
                    />
                </div>

                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-amber-400">
                        <Flame className="w-3 h-3" />
                        <span>{plan.progress.streak_days} day streak</span>
                    </div>
                    <span className="text-emerald-400">
                        {plan.progress.activities_completed}/{plan.progress.total_activities} activities
                    </span>
                </div>
            </div>
        );
    }

    // Full plan view
    return (
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border-b border-white/10">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="font-bold text-xl mb-1">{plan.plan_name}</h2>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-amber-400" />
                            <span className="font-semibold">{plan.progress.streak_days} day streak</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Best: {plan.progress.longest_streak} days
                        </p>
                    </div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-semibold text-primary">{plan.progress.completion_percentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${plan.progress.completion_percentage}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Weekly Goal */}
                {plan.weekly_goal && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="font-medium">Weekly Goal:</span>
                            <span className="text-muted-foreground">{plan.weekly_goal}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Days */}
            <div className="p-4 space-y-3">
                {plan.days.map((day) => (
                    <motion.div
                        key={day.day}
                        className={`rounded-lg border transition-colors ${day.completed
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : expandedDay === day.day
                                    ? 'bg-white/5 border-primary/30'
                                    : 'bg-white/5 border-white/10'
                            }`}
                    >
                        {/* Day header */}
                        <button
                            onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                            className="w-full p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${day.completed
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white/10'
                                    }`}>
                                    {day.completed ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <span className="text-sm font-bold">{day.day}</span>
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="font-medium">Day {day.day}: {day.theme}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {day.completion_percentage}% complete
                                    </p>
                                </div>
                            </div>
                            {expandedDay === day.day ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                        </button>

                        {/* Day content */}
                        <AnimatePresence>
                            {expandedDay === day.day && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 space-y-3">
                                        {/* Activities */}
                                        {['morning', 'afternoon', 'evening'].map((period) => {
                                            const activity = day[period as keyof PlanDay] as Activity;
                                            if (!activity) return null;

                                            const icons = {
                                                morning: Sun,
                                                afternoon: Sunset,
                                                evening: Moon
                                            };
                                            const Icon = icons[period as keyof typeof icons];

                                            return (
                                                <div
                                                    key={period}
                                                    className={`p-3 rounded-lg ${activity.completed
                                                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                                                            : 'bg-white/5 border border-white/10'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.completed ? 'bg-emerald-500' : 'bg-white/10'
                                                            }`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-medium capitalize">{period}</p>
                                                                <span className="text-xs text-muted-foreground">{activity.duration}</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{activity.activity}</p>
                                                            {activity.instructions && (
                                                                <p className="text-xs text-muted-foreground/70 mt-1">{activity.instructions}</p>
                                                            )}
                                                        </div>
                                                        {!activity.completed && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => completeActivity(day.day, period as 'morning' | 'afternoon' | 'evening')}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Journal prompt */}
                                        {day.journal_prompt && (
                                            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BookOpen className="w-4 h-4 text-purple-400" />
                                                    <span className="font-medium text-sm">Journal Prompt</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground italic mb-3">"{day.journal_prompt}"</p>

                                                {day.journal_entry ? (
                                                    <div className="p-2 bg-white/5 rounded text-sm">
                                                        {day.journal_entry}
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Write your thoughts..."
                                                            className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                            value={journalText}
                                                            onChange={(e) => setJournalText(e.target.value)}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => saveJournalEntry(day.day)}
                                                            disabled={!journalText.trim()}
                                                        >
                                                            Save
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {/* Tips */}
            {plan.tips && plan.tips.length > 0 && (
                <div className="p-4 border-t border-white/10">
                    <p className="text-xs font-medium text-muted-foreground mb-2">💡 Tips for Success</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        {plan.tips.slice(0, 3).map((tip, idx) => (
                            <li key={idx}>• {tip}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Reward */}
            {plan.progress.completion_percentage === 100 && plan.reward_suggestion && (
                <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-t border-yellow-500/20">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">Congratulations! 🎉</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Reward yourself: {plan.reward_suggestion}
                    </p>
                </div>
            )}
        </div>
    );
}
