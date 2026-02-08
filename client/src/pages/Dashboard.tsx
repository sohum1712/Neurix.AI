import { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import {
  GridBackground,
  HUDContainer,
  IsoCard,
  StatsDisplay,
  GlitchText,
  Button3D
} from '@/components/ui/BrutalistComponents';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeConversation, replica } = useTavus();

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
            <StatsDisplay key={i} {...stat} delay={i * 0.1} />
          ))}
        </div>

        {/* DASHBOARD WIDGETS */}
        <div className="grid lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN - SESSION HISTORY */}
          <div className="lg:col-span-8">
            <HUDContainer title="Recent Journey">
              <div className="space-y-1">
                <div className="grid grid-cols-4 text-xs text-muted-foreground uppercase py-2 border-b border-white/10 px-2">
                  <div>Date</div>
                  <div>Duration</div>
                  <div>Mood</div>
                  <div>Focus Area</div>
                </div>
                {recentSessions.map((s, i) => (
                  <div key={i} className="grid grid-cols-4 py-3 border-b border-white/5 font-mono text-sm hover:bg-white/5 transition-colors cursor-pointer group px-2">
                    <div className="text-white group-hover:text-primary">{s.date}</div>
                    <div className="text-muted-foreground">{s.duration}</div>
                    <div>
                      <span className="inline-block px-2 py-0.5 border border-white/20 text-[10px] uppercase rounded-full">
                        {s.mood}
                      </span>
                    </div>
                    <div className="text-muted-foreground">{s.topic}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button className="text-xs font-mono uppercase text-primary hover:underline hover:text-white transition-colors">
                  &gt;&gt; View Full History
                </button>
              </div>
            </HUDContainer>
          </div>

          {/* RIGHT COLUMN - ACTIONS & PROFILE */}
          <div className="lg:col-span-4 space-y-8">

            {/* AI AVATAR LINK - Clickable */}
            <IsoCard>
              <div
                onClick={() => navigate('/tavus')}
                className="aspect-[4/5] bg-white/5 border border-white/10 relative overflow-hidden group cursor-pointer"
              >
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 pointer-events-none z-20 mix-blend-overlay transition-opacity" />

                {replica?.thumbnail_video_url ? (
                  <video src={replica.thumbnail_video_url} autoPlay loop muted playsInline className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-card">
                    <div className="text-center">
                      <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4 group-hover:text-primary transition-colors" />
                      <p className="text-xs text-muted-foreground uppercase">Your AI Guide</p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent z-10">
                  <h3 className="font-heading text-2xl uppercase text-white mb-1">My Companion</h3>
                  <div className="flex items-center gap-2 text-primary font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Click to Start Session
                  </div>
                </div>
              </div>
            </IsoCard>

            {/* INSIGHTS LOG */}
            <div className="bg-white/5 border border-border p-6 rounded-lg font-mono text-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2 text-muted-foreground">
                <BookOpen className="w-3 h-3" />
                <span>JOURNEY_INSIGHTS</span>
              </div>
              <p className="text-emerald-500 leading-relaxed">
                &gt; Morning reflection complete.<br />
                &gt; Anxiety levels trending down.<br />
                &gt; Focus session active.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                &gt; Daily Tip: Take 5 minutes to breathe deeply before your next task.<br />
                &gt; Next Milestone: 50 Sessions.
              </p>
            </div>

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
