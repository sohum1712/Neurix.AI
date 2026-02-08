import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTavus } from '@/contexts/TavusContext';
import {
  Activity,
  Brain,
  Settings,
  Shield,
  Users,
  Zap,
  Clock,
  Cpu,
  Terminal,
  BookOpen,
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  GridBackground,
  HUDContainer,
  IsoCard,
  StatsDisplay,
  GlitchText,
  Button3D
} from '@/components/ui/BrutalistComponents';

// Import new Gemini 3 components
import WellnessPlanWidget from '@/components/WellnessPlan';
import CognitiveInsights from '@/components/CognitiveInsights';
import SessionHistory from '@/components/SessionHistory';
import EmotionTimeline from '@/components/EmotionTimeline';
import CognitiveProfileDashboard from '@/components/CognitiveProfileDashboard';
import WellnessTrajectory from '@/components/WellnessTrajectory';

// Demo video for AI companion preview
import demoVideo1 from '@/assets/model1.mp4';

// Simple error boundary component
function WidgetErrorFallback({ name }: { name: string }) {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
      <div className="flex items-center gap-2 text-red-400">
        <AlertTriangle className="w-4 h-4" />
        <span className="font-mono text-sm">Error loading {name}</span>
      </div>
    </div>
  );
}

// Safe wrapper for widgets
function SafeWidget({ name, children }: { name: string; children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <WidgetErrorFallback name={name} />;
  }

  try {
    return <>{children}</>;
  } catch (e) {
    console.error(`Error in ${name}:`, e);
    setHasError(true);
    return <WidgetErrorFallback name={name} />;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeConversation, replica } = useTavus();

  // Get userId for API calls - use Supabase user id or fallback to localStorage
  const userId = user?.id || localStorage.getItem('neurix_user_id') || 'demo_user';

  // Debug - remove after fixing
  console.log('Dashboard rendering, userId:', userId);

  // Mock Data - Softened Tone
  const stats = [
    { label: "Wellness Streak", value: "12 Days", change: "+2", isPositive: true },
    { label: "Mindful Minutes", value: "480", change: "+15%", isPositive: true },
    { label: "Mood Balance", value: "94%", change: "Stable", isPositive: true },
    { label: "Sessions", value: "24", change: "+3", isPositive: true },
  ];

  const recentSessions = [
    { date: "2024-03-20", duration: "45m", mood: "Optimistic", topic: "Anxiety Management" },
    { date: "2024-03-18", duration: "30m", mood: "Calm", topic: "Sleep Patterns" },
    { date: "2024-03-15", duration: "60m", mood: "Reflective", topic: "Cognitive Reframing" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-mono selection:bg-primary selection:text-black">
      <GridBackground />

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-6 py-12 pt-24">

        {/* WELCOME HEADER */}
        <div className="mb-12">
          <div className="inline-block px-3 py-1 mb-4 border border-white/20 bg-white/5 rounded-full">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Personal Dashboard</span>
          </div>
          <h1 className="font-heading text-5xl md:text-7xl uppercase leading-[0.85]">
            Welcome <br />
            <span className="text-primary">Back</span>
          </h1>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <StatsDisplay key={i} label={stat.label} value={stat.value} trend={stat.change} direction={stat.isPositive ? "up" : "down"} />
          ))}
        </div>

        {/* DASHBOARD WIDGETS */}
        <div className="grid lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN - SESSION HISTORY & WELLNESS */}
          <div className="lg:col-span-8 space-y-8">

            {/* Emotion Timeline - NEW */}
            <EmotionTimeline userId={userId} days={30} />

            {/* Wellness Plan Widget */}
            <HUDContainer title="Your Wellness Plan">
              <WellnessPlanWidget userId={userId} compact={false} />
            </HUDContainer>

            {/* Cognitive Profile Dashboard - NEW */}
            <CognitiveProfileDashboard userId={userId} />

            {/* Session History */}
            <HUDContainer title="Session History">
              <SessionHistory userId={userId} limit={5} />
            </HUDContainer>
          </div>

          {/* RIGHT COLUMN - ACTIONS & PROFILE */}
          <div className="lg:col-span-4 space-y-8">

            {/* Wellness Trajectory - NEW */}
            <WellnessTrajectory userId={userId} />

            {/* AI AVATAR LINK - Clickable */}
            <IsoCard>
              <div
                onClick={() => navigate('/tavus')}
                className="aspect-[4/5] bg-white/5 border border-white/10 relative overflow-hidden group cursor-pointer"
              >
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 pointer-events-none z-20 mix-blend-overlay transition-opacity" />

                {/* Demo Video - Always show loop video */}
                <video
                  src={demoVideo1}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <h3 className="font-heading text-2xl uppercase text-white mb-1">My Companion</h3>
                  <div className="flex items-center gap-2 text-primary font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Click to Start Session
                  </div>
                </div>
              </div>
            </IsoCard>

            {/* COGNITIVE INSIGHTS - AI-powered user profile */}
            <CognitiveInsights userId={userId} compact={true} />

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-1 gap-4">
              {/* Primary Action - Start AI Session */}
              <Button3D variant="primary" className="justify-between group" onClick={() => navigate('/tavus')}>
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start AI Session
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Button3D>

              {/* Secondary Actions */}
              {[
                { label: "Community Circle", icon: Users, path: '/community' },
                { label: "Resource Library", icon: BookOpen, path: '/resources' },
                { label: "Settings", icon: Settings, path: '/settings' }
              ].map((action, i) => (
                <Button3D key={i} variant="outline" className="justify-between group" onClick={() => navigate(action.path)}>
                  <span className="flex items-center gap-2">
                    <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    {action.label}
                  </span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Button3D>
              ))}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
