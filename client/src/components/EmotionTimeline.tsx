/**
 * EmotionTimeline Component
 * Visual timeline showing emotional journey over sessions
 * Displays emotion patterns, intensity, and trajectory
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HUDContainer } from './ui/BrutalistComponents';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface EmotionData {
  date: Date;
  mood: string;
  intensity: number;
  context?: string;
  source: string;
}

interface EmotionTimelineProps {
  userId: string;
  data?: EmotionData[];
  days?: number;
  className?: string;
}

// Emotion color mapping
const emotionColors: Record<string, string> = {
  anxious: 'bg-amber-500',
  sad: 'bg-blue-500',
  calm: 'bg-green-500',
  stressed: 'bg-orange-500',
  overwhelmed: 'bg-red-500',
  hopeful: 'bg-emerald-500',
  angry: 'bg-red-600',
  neutral: 'bg-gray-400',
  confused: 'bg-purple-500',
  relieved: 'bg-teal-500',
  happy: 'bg-yellow-400',
  fearful: 'bg-indigo-500',
  frustrated: 'bg-orange-600',
  lonely: 'bg-blue-600',
  content: 'bg-green-400',
};

const emotionEmojis: Record<string, string> = {
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
  fearful: '😨',
  frustrated: '😤',
  lonely: '😔',
  content: '😊',
};

export default function EmotionTimeline({ userId, data, days = 30, className }: EmotionTimelineProps) {
  const [emotionData, setEmotionData] = useState<EmotionData[]>(data || []);
  const [loading, setLoading] = useState(!data);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [trajectory, setTrajectory] = useState<'improving' | 'stable' | 'declining'>('stable');

  useEffect(() => {
    if (!data && userId) {
      // Fetch emotion data from API
      fetchEmotionData();
    }
  }, [userId, data]);

  const fetchEmotionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chatbot/profile/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const insights = await response.json();
      
      // Transform data for timeline
      if (insights.emotional) {
        // Mock data for now - replace with actual API data
        const mockData: EmotionData[] = Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
          mood: ['calm', 'anxious', 'hopeful', 'stressed', 'content'][Math.floor(Math.random() * 5)],
          intensity: Math.random() * 0.8 + 0.2,
          source: 'ai_detected'
        }));
        setEmotionData(mockData);
        
        // Calculate trajectory
        const firstHalf = mockData.slice(0, Math.floor(mockData.length / 2));
        const secondHalf = mockData.slice(Math.floor(mockData.length / 2));
        const firstAvg = firstHalf.reduce((sum, d) => sum + d.intensity, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, d) => sum + d.intensity, 0) / secondHalf.length;
        
        if (secondAvg < firstAvg - 0.1) setTrajectory('improving');
        else if (secondAvg > firstAvg + 0.1) setTrajectory('declining');
        else setTrajectory('stable');
      }
    } catch (error) {
      console.error('Failed to fetch emotion data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <HUDContainer title="EMOTIONAL JOURNEY" className={className}>
        <div className="flex items-center justify-center h-48">
          <Activity className="w-6 h-6 animate-pulse text-primary" />
          <span className="ml-2 font-mono text-sm text-muted-foreground">Loading timeline...</span>
        </div>
      </HUDContainer>
    );
  }

  if (emotionData.length === 0) {
    return (
      <HUDContainer title="EMOTIONAL JOURNEY" className={className}>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p className="font-mono text-sm">No emotion data available yet</p>
        </div>
      </HUDContainer>
    );
  }

  // Calculate statistics
  const avgIntensity = emotionData.reduce((sum, d) => sum + d.intensity, 0) / emotionData.length;
  const dominantEmotion = emotionData.reduce((acc, d) => {
    acc[d.mood] = (acc[d.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dominant = Object.entries(dominantEmotion).sort((a, b) => b[1] - a[1])[0];

  return (
    <HUDContainer title="EMOTIONAL JOURNEY" timestamp className={className}>
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase text-muted-foreground mb-1">Dominant</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emotionEmojis[dominant[0]]}</span>
            <span className="font-mono text-sm capitalize">{dominant[0]}</span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase text-muted-foreground mb-1">Avg Intensity</span>
          <div className="flex items-center gap-2">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${avgIntensity * 100}%` }}
              />
            </div>
            <span className="font-mono text-sm">{(avgIntensity * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase text-muted-foreground mb-1">Trajectory</span>
          <div className="flex items-center gap-2">
            {trajectory === 'improving' && <TrendingDown className="w-4 h-4 text-green-500" />}
            {trajectory === 'declining' && <TrendingUp className="w-4 h-4 text-red-500" />}
            {trajectory === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
            <span className={cn(
              "font-mono text-sm capitalize",
              trajectory === 'improving' && 'text-green-500',
              trajectory === 'declining' && 'text-red-500',
              trajectory === 'stable' && 'text-gray-400'
            )}>
              {trajectory}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Horizontal scrollable container */}
        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <div className="flex items-end gap-2 min-w-max px-2" style={{ minWidth: `${emotionData.length * 40}px` }}>
            {emotionData.map((point, index) => {
              const height = point.intensity * 100;
              const isHovered = hoveredPoint === index;

              return (
                <motion.div
                  key={index}
                  className="relative flex flex-col items-center group"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full mb-2 bg-card border border-primary/30 rounded-lg p-3 shadow-xl z-10 min-w-[180px]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{emotionEmojis[point.mood]}</span>
                        <span className="font-mono text-sm capitalize font-bold">{point.mood}</span>
                      </div>
                      <div className="space-y-1 text-[10px] font-mono text-muted-foreground">
                        <div>Intensity: {(point.intensity * 100).toFixed(0)}%</div>
                        <div>Date: {new Date(point.date).toLocaleDateString()}</div>
                        {point.context && <div className="text-xs mt-2 text-foreground">{point.context}</div>}
                      </div>
                    </motion.div>
                  )}

                  {/* Bar */}
                  <motion.div
                    className={cn(
                      "w-8 rounded-t-sm transition-all duration-300 cursor-pointer",
                      emotionColors[point.mood] || 'bg-gray-400',
                      isHovered && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    )}
                    style={{ height: `${height}px`, minHeight: '20px' }}
                    whileHover={{ scale: 1.1 }}
                  />

                  {/* Date label (show every 7th) */}
                  {index % 7 === 0 && (
                    <span className="absolute -bottom-6 font-mono text-[8px] text-muted-foreground whitespace-nowrap">
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 pt-4 border-t border-white/10">
          <div className="flex flex-wrap gap-3">
            {Object.entries(emotionColors).slice(0, 8).map(([emotion, color]) => (
              <div key={emotion} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-sm", color)} />
                <span className="font-mono text-[10px] capitalize text-muted-foreground">{emotion}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HUDContainer>
  );
}
