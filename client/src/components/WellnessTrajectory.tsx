/**
 * Wellness Trajectory Component
 * Predictive chart showing emotional trends and burnout risk
 * Displays warning indicators and preventive action recommendations
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HUDContainer } from './ui/BrutalistComponents';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity,
  Shield,
  Zap,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrajectoryData {
  trend: string;
  confidence: number;
  burnout_risk: number;
  predicted_mood_7_days: string;
  warning_signs: string[];
  positive_indicators: string[];
  preventive_actions: string[];
  reasoning: string;
}

interface WellnessTrajectoryProps {
  userId: string;
  className?: string;
}

export default function WellnessTrajectory({ userId, className }: WellnessTrajectoryProps) {
  const [trajectory, setTrajectory] = useState<TrajectoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrajectory();
  }, [userId]);

  const fetchTrajectory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chatbot/wellness/trajectory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) throw new Error('Failed to fetch trajectory');

      const data = await response.json();
      setTrajectory(data);
    } catch (err: any) {
      console.error('Trajectory fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <HUDContainer title="WELLNESS TRAJECTORY" className={className}>
        <div className="flex items-center justify-center h-48">
          <Activity className="w-6 h-6 animate-pulse text-primary" />
          <span className="ml-2 font-mono text-sm text-muted-foreground">Analyzing trajectory...</span>
        </div>
      </HUDContainer>
    );
  }

  if (error || !trajectory) {
    return (
      <HUDContainer title="WELLNESS TRAJECTORY" className={className}>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p className="font-mono text-sm">{error || 'Not enough data for prediction'}</p>
        </div>
      </HUDContainer>
    );
  }

  const getTrendIcon = () => {
    switch (trajectory.trend) {
      case 'improving':
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-6 h-6 text-red-500" />;
      default:
        return <Activity className="w-6 h-6 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trajectory.trend) {
      case 'improving':
        return 'text-green-500';
      case 'declining':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getBurnoutRiskLevel = () => {
    if (trajectory.burnout_risk >= 0.7) return { level: 'High', color: 'text-red-500', bg: 'bg-red-500' };
    if (trajectory.burnout_risk >= 0.4) return { level: 'Medium', color: 'text-amber-500', bg: 'bg-amber-500' };
    return { level: 'Low', color: 'text-green-500', bg: 'bg-green-500' };
  };

  const burnoutRisk = getBurnoutRiskLevel();

  return (
    <HUDContainer title="WELLNESS TRAJECTORY" timestamp className={className}>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-4">
          {/* Trend */}
          <div className="flex flex-col items-center p-4 bg-white/5 border border-white/10 rounded-lg">
            {getTrendIcon()}
            <span className="font-mono text-xs uppercase text-muted-foreground mt-2">Trend</span>
            <span className={cn("font-mono text-sm font-bold capitalize mt-1", getTrendColor())}>
              {trajectory.trend}
            </span>
          </div>

          {/* Confidence */}
          <div className="flex flex-col items-center p-4 bg-white/5 border border-white/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-mono text-xs uppercase text-muted-foreground mt-2">Confidence</span>
            <span className="font-mono text-sm font-bold text-primary mt-1">
              {(trajectory.confidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Burnout Risk */}
          <div className="flex flex-col items-center p-4 bg-white/5 border border-white/10 rounded-lg">
            <Zap className={cn("w-6 h-6", burnoutRisk.color)} />
            <span className="font-mono text-xs uppercase text-muted-foreground mt-2">Burnout Risk</span>
            <span className={cn("font-mono text-sm font-bold mt-1", burnoutRisk.color)}>
              {burnoutRisk.level}
            </span>
          </div>
        </div>

        {/* Burnout Risk Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-muted-foreground">Risk Level</span>
            <span className="font-mono text-xs text-muted-foreground">
              {(trajectory.burnout_risk * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trajectory.burnout_risk * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn("h-full", burnoutRisk.bg)}
            />
          </div>
        </div>

        {/* Prediction */}
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-xs uppercase text-primary mb-1">7-Day Prediction</p>
              <p className="font-sans text-sm text-foreground/90 capitalize">
                Predicted mood: <span className="font-bold text-primary">{trajectory.predicted_mood_7_days}</span>
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-2">{trajectory.reasoning}</p>
            </div>
          </div>
        </div>

        {/* Warning Signs */}
        {trajectory.warning_signs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="font-mono text-xs uppercase text-amber-500">Warning Signs</span>
            </div>
            <div className="space-y-2">
              {trajectory.warning_signs.map((sign, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                  <span className="font-mono text-xs text-foreground/90">{sign}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Positive Indicators */}
        {trajectory.positive_indicators.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-mono text-xs uppercase text-green-500">Positive Indicators</span>
            </div>
            <div className="space-y-2">
              {trajectory.positive_indicators.map((indicator, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                  <span className="font-mono text-xs text-foreground/90">{indicator}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Preventive Actions */}
        {trajectory.preventive_actions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="font-mono text-xs uppercase text-blue-500">Preventive Actions</span>
            </div>
            <div className="space-y-2">
              {trajectory.preventive_actions.map((action, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:border-blue-500/40 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-xs text-blue-500">{idx + 1}</span>
                  </div>
                  <span className="font-mono text-xs text-foreground/90">{action}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={fetchTrajectory}
            disabled={loading}
            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-lg font-mono text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Refresh Prediction'}
          </button>
        </div>
      </div>
    </HUDContainer>
  );
}
