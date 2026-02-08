/**
 * Journey Page
 * Comprehensive view of user's wellness journey
 * Combines life narrative, trajectory, and historical comparison
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GridBackground } from '@/components/ui/BrutalistComponents';
import LifeNarrativeView from '@/components/LifeNarrativeView';
import WellnessTrajectory from '@/components/WellnessTrajectory';
import EmotionTimeline from '@/components/EmotionTimeline';
import { HUDContainer } from '@/components/ui/BrutalistComponents';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoricalComparison {
  comparison: string;
  improvement_percentage: string;
  narrative: string;
  encouragement: string;
  timeframe: string;
  improvements: string[];
  concerns: string[];
}

export default function Journey() {
  const { user } = useAuth();
  const userId = user?.id || localStorage.getItem('neurix_user_id') || 'demo_user';

  const [comparison, setComparison] = useState<HistoricalComparison | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(true);

  useEffect(() => {
    fetchComparison();
  }, [userId]);

  const fetchComparison = async () => {
    try {
      setLoadingComparison(true);
      const response = await fetch('/api/chatbot/narrative/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, timeframe: 30 })
      });

      if (response.ok) {
        const data = await response.json();
        setComparison(data);
      }
    } catch (error) {
      console.error('Comparison fetch error:', error);
    } finally {
      setLoadingComparison(false);
    }
  };

  const getComparisonColor = () => {
    if (!comparison) return 'text-gray-400';
    switch (comparison.comparison) {
      case 'significant_improvement':
      case 'improving':
        return 'text-green-500';
      case 'needs_attention':
      case 'declining':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <GridBackground />

      <div className="container mx-auto px-6 py-12 pt-24">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-block px-3 py-1 mb-4 border border-white/20 bg-white/5 rounded-full">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Your Wellness Journey</span>
          </div>
          <h1 className="font-heading text-5xl md:text-7xl uppercase leading-[0.85]">
            Your <br />
            <span className="text-primary">Story</span>
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-4 max-w-2xl">
            A compassionate look at your growth, patterns, and path forward
          </p>
        </div>

        {/* Historical Comparison Card */}
        {comparison && !loadingComparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <HUDContainer title="PROGRESS SNAPSHOT">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center`}>
                      <TrendingUp className={`w-6 h-6 ${getComparisonColor()}`} />
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase text-muted-foreground">30-Day Comparison</p>
                      <p className={`font-mono text-lg font-bold capitalize ${getComparisonColor()}`}>
                        {comparison.comparison.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-muted-foreground">Change</p>
                    <p className={`font-mono text-2xl font-bold ${getComparisonColor()}`}>
                      {comparison.improvement_percentage}%
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-sans text-sm text-foreground/90 mb-3">{comparison.narrative}</p>
                  <p className="font-sans text-sm text-primary italic">{comparison.encouragement}</p>
                </div>

                {comparison.improvements.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="font-mono text-xs uppercase text-green-500 mb-2">Improvements</p>
                      <ul className="space-y-1">
                        {comparison.improvements.map((imp, idx) => (
                          <li key={idx} className="font-mono text-xs text-foreground/80 flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {comparison.concerns.length > 0 && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="font-mono text-xs uppercase text-amber-500 mb-2">Areas to Watch</p>
                        <ul className="space-y-1">
                          {comparison.concerns.map((concern, idx) => (
                            <li key={idx} className="font-mono text-xs text-foreground/80 flex items-start gap-2">
                              <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span>{concern}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </HUDContainer>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Narrative */}
          <div className="lg:col-span-8 space-y-8">
            <LifeNarrativeView userId={userId} />
            <EmotionTimeline userId={userId} days={60} />
          </div>

          {/* Right Column - Trajectory */}
          <div className="lg:col-span-4 space-y-8">
            <WellnessTrajectory userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
