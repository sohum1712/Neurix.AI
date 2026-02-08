/**
 * SessionHistory Component - Displays past therapy sessions with AI summaries
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    MessageSquare,
    Star,
    ChevronDown,
    ChevronUp,
    Loader2,
    TrendingUp,
    TrendingDown,
    Minus,
    Video,
    FileText
} from 'lucide-react';
import { api } from '@/utils/api';

interface SessionSummary {
    overview?: string;
    emotional_journey?: string;
    key_themes?: string[];
    breakthroughs?: string[];
    concerns?: string[];
    recommended_focus_next?: string;
    mood_at_start?: string;
    mood_at_end?: string;
    quality_score?: number;
}

interface EmotionMetrics {
    dominant_emotion?: string;
    average_intensity?: number;
    trajectory?: 'improving' | 'stable' | 'declining' | 'fluctuating';
}

interface Session {
    _id: string;
    type: 'chat' | 'video' | 'booking';
    status: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    summary?: SessionSummary;
    emotionMetrics?: EmotionMetrics;
}

interface SessionStats {
    total_sessions: number;
    total_duration: number;
    average_duration: number;
    average_quality: number;
}

interface SessionHistoryProps {
    userId?: string;
    limit?: number;
}

// Format duration
function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
}

// Format date
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
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
    unknown: '💭',
};

export default function SessionHistory({ userId, limit = 10 }: SessionHistoryProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [stats, setStats] = useState<SessionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSession, setExpandedSession] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            fetchSessions();
        } else {
            setLoading(false);
        }
    }, [userId, limit]);

    const fetchSessions = async () => {
        try {
            const { data } = await api.get(`/sessions/${userId}?limit=${limit}`);
            if (data.success) {
                setSessions(data.sessions);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
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

    if (!sessions || sessions.length === 0) {
        return (
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No session history yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start chatting to see your history here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Stats Card */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-6 border border-primary/20"
                >
                    <h3 className="font-bold mb-4">Session Overview</h3>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-primary">{stats.total_sessions}</p>
                            <p className="text-xs text-muted-foreground">Sessions</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{Math.round(stats.total_duration / 60)}</p>
                            <p className="text-xs text-muted-foreground">Total Min</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-400">{Math.round(stats.average_duration / 60)}</p>
                            <p className="text-xs text-muted-foreground">Avg Min</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-2xl font-bold">{stats.average_quality.toFixed(1)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Avg Quality</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Sessions List */}
            <div className="space-y-3">
                {sessions.map((session, idx) => (
                    <motion.div
                        key={session._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`bg-card/50 backdrop-blur-sm rounded-xl border transition-colors ${expandedSession === session._id
                                ? 'border-primary/30'
                                : 'border-white/10'
                            }`}
                    >
                        {/* Session Header */}
                        <button
                            onClick={() => setExpandedSession(
                                expandedSession === session._id ? null : session._id
                            )}
                            className="w-full p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                {/* Type Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${session.type === 'video'
                                        ? 'bg-purple-500/20'
                                        : 'bg-blue-500/20'
                                    }`}>
                                    {session.type === 'video' ? (
                                        <Video className="w-5 h-5 text-purple-400" />
                                    ) : (
                                        <MessageSquare className="w-5 h-5 text-blue-400" />
                                    )}
                                </div>

                                {/* Session Info */}
                                <div className="text-left">
                                    <p className="font-medium text-sm capitalize">
                                        {session.type} Session
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(session.startTime)}</span>
                                        {session.duration && (
                                            <>
                                                <span>•</span>
                                                <Clock className="w-3 h-3" />
                                                <span>{formatDuration(session.duration)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Trajectory indicator */}
                                {session.emotionMetrics?.trajectory && (
                                    <TrajectoryBadge trajectory={session.emotionMetrics.trajectory} />
                                )}

                                {/* Quality score */}
                                {session.summary?.quality_score && (
                                    <div className="flex items-center gap-1 text-sm">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        <span>{session.summary.quality_score}</span>
                                    </div>
                                )}

                                {/* Expand icon */}
                                {expandedSession === session._id ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                            </div>
                        </button>

                        {/* Session Details */}
                        <AnimatePresence>
                            {expandedSession === session._id && session.summary && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 space-y-4">
                                        {/* Mood Journey */}
                                        {(session.summary.mood_at_start || session.summary.mood_at_end) && (
                                            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                                                <span className="text-sm">Mood:</span>
                                                {session.summary.mood_at_start && (
                                                    <span className="text-xl">
                                                        {moodEmojis[session.summary.mood_at_start] || '💭'}
                                                    </span>
                                                )}
                                                <span className="text-muted-foreground">→</span>
                                                {session.summary.mood_at_end && (
                                                    <span className="text-xl">
                                                        {moodEmojis[session.summary.mood_at_end] || '💭'}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Overview */}
                                        {session.summary.overview && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    <FileText className="w-3 h-3 inline-block mr-1" />
                                                    Summary
                                                </p>
                                                <p className="text-sm">{session.summary.overview}</p>
                                            </div>
                                        )}

                                        {/* Emotional Journey */}
                                        {session.summary.emotional_journey && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Journey</p>
                                                <p className="text-sm text-muted-foreground">{session.summary.emotional_journey}</p>
                                            </div>
                                        )}

                                        {/* Key Themes */}
                                        {session.summary.key_themes && session.summary.key_themes.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-2">Themes</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {session.summary.key_themes.map((theme, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full"
                                                        >
                                                            {theme}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Breakthroughs */}
                                        {session.summary.breakthroughs && session.summary.breakthroughs.length > 0 && (
                                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                <p className="text-xs font-medium text-emerald-400 mb-1">✨ Breakthroughs</p>
                                                <ul className="text-sm space-y-1">
                                                    {session.summary.breakthroughs.map((bt, i) => (
                                                        <li key={i}>• {bt}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Concerns */}
                                        {session.summary.concerns && session.summary.concerns.length > 0 && (
                                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                                <p className="text-xs font-medium text-amber-400 mb-1">🔍 Areas to Explore</p>
                                                <ul className="text-sm space-y-1">
                                                    {session.summary.concerns.map((concern, i) => (
                                                        <li key={i}>• {concern}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Next Focus */}
                                        {session.summary.recommended_focus_next && (
                                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                                <p className="text-xs font-medium text-blue-400 mb-1">🎯 Focus Next</p>
                                                <p className="text-sm">{session.summary.recommended_focus_next}</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// Trajectory badge component
function TrajectoryBadge({ trajectory }: { trajectory: string }) {
    const config: Record<string, { icon: any; color: string }> = {
        improving: { icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/20' },
        stable: { icon: Minus, color: 'text-blue-400 bg-blue-500/20' },
        declining: { icon: TrendingDown, color: 'text-amber-400 bg-amber-500/20' },
        fluctuating: { icon: TrendingUp, color: 'text-purple-400 bg-purple-500/20' },
    };

    const { icon: Icon, color } = config[trajectory] || config.stable;

    return (
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${color}`}>
            <Icon className="w-3 h-3" />
        </div>
    );
}
