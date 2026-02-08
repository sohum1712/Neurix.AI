/**
 * Cognitive Profile Dashboard
 * Shows user's digital twin with insights, triggers, patterns, and growth
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HUDContainer, IsoCard, StatsDisplay } from './ui/BrutalistComponents';
import { Brain, AlertTriangle, Heart, TrendingUp, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileInsights {
  userId: string;
  baseline: {
    mood: string;
    lastUpdated: Date;
  };
  emotional: {
    dominant_emotion: string;
    average_intensity: string;
    trajectory: string;
    volatility: string;
    total_data_points: number;
  };
  triggers: {
    total: number;
    high_severity: Array<{ trigger: string; severity: number; frequency: string }>;
    frequent: string[];
    recommendations: string[];
  };
  interventions: {
    total: number;
    most_effective: Array<{ intervention: string; success_rate: string; times_used: number }>;
    average_success_rate: string;
  };
  growth: {
    total_sessions: number;
    average_quality: string;
    improvement_trend: string;
    milestones: number;
  };
  concerns: {
    total: number;
    active: Array<{ concern: string; severity: number; times_discussed: number }>;
    improving: string[];
    needs_attention: number;
  };
  stats: {
    total_sessions: number;
    total_messages: number;
    crisis_interventions: number;
  };
}

interface CognitiveProfileDashboardProps {
  userId: string;
  className?: string;
}

export default function CognitiveProfileDashboard({ userId, className }: CognitiveProfileDashboardProps) {
  const [insights, setInsights] = useState<ProfileInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chatbot/profile/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) throw new Error('Failed to fetch insights');

      const data = await response.json();
      setInsights(data);
    } catch (err: any) {
      console.error('Profile insights error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("grid gap-6", className)}>
        <HUDContainer title="COGNITIVE PROFILE">
          <div className="flex items-center justify-center h-48">
            <Brain className="w-8 h-8 animate-pulse text-primary" />
            <span className="ml-3 font-mono text-sm text-muted-foreground">Analyzing profile...</span>
          </div>
        </HUDContainer>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className={cn("grid gap-6", className)}>
        <HUDContainer title="COGNITIVE PROFILE">
          <div className="flex items-center justify-center h-48 text-red-500">
            <AlertTriangle className="w-6 h-6 mr-2" />
            <span className="font-mono text-sm">{error || 'Failed to load profile'}</span>
          </div>
        </HUDContainer>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", className)}>
      {/* Header Stats */}
      <HUDContainer title="COGNITIVE DIGITAL TWIN" timestamp>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatsDisplay
            label="Total Sessions"
            value={insights.stats.total_sessions}
            trend={`${insights.growth.improvement_trend}`}
            direction={insights.growth.improvement_trend === 'improving' ? 'up' : 'neutral'}
          />
          <StatsDisplay
            label="Messages"
            value={insights.stats.total_messages}
          />
          <StatsDisplay
            label="Avg Quality"
            value={insights.growth.average_quality}
            trend="Session quality"
          />
          <StatsDisplay
            label="Milestones"
            value={insights.growth.milestones}
            direction="up"
          />
        </div>
      </HUDContainer>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Emotional Patterns */}
        <IsoCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-mono text-sm uppercase tracking-wider font-bold">Emotional Patterns</h3>
              <p className="font-mono text-[10px] text-muted-foreground">Last {insights.emotional.total_data_points} data points</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-muted-foreground">Dominant Emotion</span>
                <span className="font-mono text-sm capitalize font-bold text-primary">{insights.emotional.dominant_emotion}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-muted-foreground">Avg Intensity</span>
                <span className="font-mono text-sm">{insights.emotional.average_intensity}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-muted-foreground">Trajectory</span>
                <span className={cn(
                  "font-mono text-sm capitalize font-bold",
                  insights.emotional.trajectory === 'improving' && 'text-green-500',
                  insights.emotional.trajectory === 'declining' && 'text-red-500',
                  insights.emotional.trajectory === 'stable' && 'text-gray-400'
                )}>
                  {insights.emotional.trajectory}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-muted-foreground">Volatility</span>
                <span className="font-mono text-sm">{insights.emotional.volatility}</span>
              </div>
            </div>
          </div>
        </IsoCard>

        {/* Triggers */}
        <IsoCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-mono text-sm uppercase tracking-wider font-bold">Triggers</h3>
              <p className="font-mono text-[10px] text-muted-foreground">{insights.triggers.total} identified</p>
            </div>
          </div>

          <div className="space-y-3">
            {insights.triggers.high_severity.length > 0 ? (
              insights.triggers.high_severity.map((trigger, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded"
                >
                  <span className="font-mono text-xs">{trigger.trigger}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground capitalize">{trigger.frequency}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      trigger.severity >= 8 ? 'bg-red-500' : trigger.severity >= 6 ? 'bg-amber-500' : 'bg-yellow-500'
                    )} />
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="font-mono text-xs text-muted-foreground text-center py-4">No high-severity triggers identified</p>
            )}

            {insights.triggers.recommendations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="font-mono text-[10px] uppercase text-muted-foreground mb-2">Recommendations</p>
                {insights.triggers.recommendations.map((rec, idx) => (
                  <p key={idx} className="font-mono text-xs text-primary mb-1">• {rec}</p>
                ))}
              </div>
            )}
          </div>
        </IsoCard>

        {/* Effective Interventions */}
        <IsoCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-mono text-sm uppercase tracking-wider font-bold">Effective Interventions</h3>
              <p className="font-mono text-[10px] text-muted-foreground">Avg success: {insights.interventions.average_success_rate}</p>
            </div>
          </div>

          <div className="space-y-3">
            {insights.interventions.most_effective.length > 0 ? (
              insights.interventions.most_effective.map((intervention, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-white/5 border border-white/10 rounded"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold">{intervention.intervention}</span>
                    <span className="font-mono text-xs text-green-500">{intervention.success_rate}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: intervention.success_rate }}
                    />
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">Used {intervention.times_used} times</p>
                </motion.div>
              ))
            ) : (
              <p className="font-mono text-xs text-muted-foreground text-center py-4">Building intervention history...</p>
            )}
          </div>
        </IsoCard>

        {/* Active Concerns */}
        <IsoCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-mono text-sm uppercase tracking-wider font-bold">Active Concerns</h3>
              <p className="font-mono text-[10px] text-muted-foreground">{insights.concerns.total} total, {insights.concerns.needs_attention} need attention</p>
            </div>
          </div>

          <div className="space-y-3">
            {insights.concerns.active.length > 0 ? (
              insights.concerns.active.map((concern, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded"
                >
                  <span className="font-mono text-xs">{concern.concern}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{concern.times_discussed}x</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      concern.severity >= 7 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                    )} />
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="font-mono text-xs text-muted-foreground text-center py-4">No active concerns</p>
            )}

            {insights.concerns.improving.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="font-mono text-[10px] uppercase text-green-500 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Improving
                </p>
                {insights.concerns.improving.map((concern, idx) => (
                  <p key={idx} className="font-mono text-xs text-muted-foreground mb-1">• {concern}</p>
                ))}
              </div>
            )}
          </div>
        </IsoCard>
      </div>
    </div>
  );
}
