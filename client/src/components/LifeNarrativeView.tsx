/**
 * Life Narrative View
 * Beautiful timeline showing user's wellness journey
 * Displays growth milestones, recurring themes, and progress narrative
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HUDContainer } from './ui/BrutalistComponents';
import { 
  Sparkles, 
  TrendingUp, 
  Heart, 
  Target, 
  Calendar,
  Award,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LifeNarrative {
  narrative: string;
  recurring_themes: string[];
  growth_trajectory: string;
  key_strengths: string[];
  areas_of_focus: string[];
  milestone_moments: string[];
  future_outlook: string;
  narrative_tone: string;
  generatedAt: Date;
  sessionsAnalyzed: number;
  profileAge: number;
}

interface LifeNarrativeViewProps {
  userId: string;
  className?: string;
}

export default function LifeNarrativeView({ userId, className }: LifeNarrativeViewProps) {
  const [narrative, setNarrative] = useState<LifeNarrative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNarrative();
  }, [userId]);

  const fetchNarrative = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chatbot/narrative/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) throw new Error('Failed to fetch narrative');

      const data = await response.json();
      setNarrative(data);
    } catch (err: any) {
      console.error('Narrative fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <HUDContainer title="YOUR JOURNEY">
          <div className="flex items-center justify-center h-64">
            <BookOpen className="w-8 h-8 animate-pulse text-primary" />
            <span className="ml-3 font-mono text-sm text-muted-foreground">Crafting your story...</span>
          </div>
        </HUDContainer>
      </div>
    );
  }

  if (error || !narrative) {
    return (
      <div className={cn("space-y-6", className)}>
        <HUDContainer title="YOUR JOURNEY">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="font-mono text-sm text-muted-foreground mb-2">
              {error || 'Not enough data to generate your narrative yet'}
            </p>
            <p className="font-mono text-xs text-muted-foreground/70">
              Continue your wellness journey to build your story
            </p>
          </div>
        </HUDContainer>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Narrative */}
      <HUDContainer title="YOUR JOURNEY" timestamp>
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-mono text-lg font-bold">Your Story</h3>
                <p className="font-mono text-xs text-muted-foreground">
                  {narrative.profileAge} days • {narrative.sessionsAnalyzed} sessions analyzed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-muted-foreground uppercase">Tone</p>
              <p className="font-mono text-sm capitalize text-primary">{narrative.narrative_tone}</p>
            </div>
          </div>

          {/* Narrative Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-invert max-w-none"
          >
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              {narrative.narrative.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="font-sans text-sm">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Growth Trajectory */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-xs uppercase text-primary mb-1">Growth Trajectory</p>
                <p className="font-sans text-sm text-foreground/90">{narrative.growth_trajectory}</p>
              </div>
            </div>
          </div>

          {/* Future Outlook */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-xs uppercase text-yellow-400 mb-1">Looking Forward</p>
                <p className="font-sans text-sm text-foreground/90">{narrative.future_outlook}</p>
              </div>
            </div>
          </div>
        </div>
      </HUDContainer>

      {/* Grid of Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <HUDContainer title="KEY STRENGTHS">
          <div className="space-y-3">
            {narrative.key_strengths.map((strength, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-green-500" />
                </div>
                <span className="font-mono text-sm">{strength}</span>
              </motion.div>
            ))}
          </div>
        </HUDContainer>

        {/* Areas of Focus */}
        <HUDContainer title="AREAS OF FOCUS">
          <div className="space-y-3">
            {narrative.areas_of_focus.map((area, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-blue-500" />
                </div>
                <span className="font-mono text-sm">{area}</span>
              </motion.div>
            ))}
          </div>
        </HUDContainer>
      </div>

      {/* Recurring Themes */}
      <HUDContainer title="RECURRING THEMES">
        <div className="flex flex-wrap gap-3">
          {narrative.recurring_themes.map((theme, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-full"
            >
              <span className="font-mono text-xs text-primary">{theme}</span>
            </motion.div>
          ))}
        </div>
      </HUDContainer>

      {/* Milestone Moments */}
      {narrative.milestone_moments.length > 0 && (
        <HUDContainer title="MILESTONE MOMENTS">
          <div className="space-y-4">
            {narrative.milestone_moments.map((moment, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-sm text-foreground/90">{moment}</p>
                </div>
                <div className="flex-shrink-0">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        </HUDContainer>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchNarrative}
          disabled={loading}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-lg font-mono text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Refresh Narrative'}
        </button>
      </div>
    </div>
  );
}
