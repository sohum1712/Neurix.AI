import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTavus } from '@/contexts/TavusContext';
import {
  ArrowRight,
  Brain,
  Shield,
  Zap,
  Activity,
  Lock,
  Terminal,
  Cpu,
  Globe,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  GridBackground,
  Button3D,
  TickerTape,
  IsoCard,
  GlitchText,
  HUDContainer
} from '@/components/ui/BrutalistComponents';
import { useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { replica, refreshReplica, loading } = useTavus();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  // Fetch replica on mount for preview
  useEffect(() => {
    refreshReplica().catch(console.error);
  }, []);

  const handleStartSession = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/roll');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-black font-mono">
      <GridBackground />

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col pt-32 border-b border-border">
        <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-12 gap-12 h-full items-start">

          {/* Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-8 z-10">
            <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-3 py-1 w-fit">
              <span className="w-2 h-2 bg-primary animate-pulse" />
              <span className="font-mono text-xs text-primary uppercase tracking-widest">Platform Status: Active</span>
            </div>

            <h1 className="text-[12vw] lg:text-[7rem] font-bold leading-[0.85] tracking-tighter uppercase font-heading text-foreground">
              Mental <br />
              <GlitchText text="Wellness" className="text-primary-foreground" /> <br />
              Journey
            </h1>

            <p className="max-w-xl text-xl md:text-2xl text-muted-foreground font-body leading-relaxed border-l-2 border-white/20 pl-6">
              A personal space for cognitive growth.
              Not just therapy—<span className="text-foreground font-bold">empowerment.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mt-4">
              <Button3D onClick={handleStartSession} variant="primary">
                Begin Journey
              </Button3D>
              <Button3D onClick={() => navigate('/resources')} variant="outline">
                Explore Resources
              </Button3D>
            </div>

            <div className="flex items-center gap-8 mt-12 text-muted-foreground font-mono text-xs uppercase">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Private & Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>AI Powered Guide</span>
              </div>
            </div>
          </div>

          {/* Right Visuals - Tavus AI Preview */}
          <div className="lg:col-span-5 h-full relative min-h-[400px] lg:min-h-0 hidden lg:block">
            <motion.div style={{ y: y1 }} className="absolute top-0 right-0 w-full h-full z-0">
              <IsoCard>
                <div
                  className="w-full h-[500px] bg-card border border-white/10 relative overflow-hidden flex items-center justify-center rounded-md cursor-pointer group"
                  onClick={() => navigate(user ? '/tavus' : '/role')}
                >
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10">
                    {[...Array(36)].map((_, i) => (
                      <div key={i} className="border border-white/20" />
                    ))}
                  </div>

                  {/* Tavus Video Preview */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {replica?.thumbnail_video_url ? (
                      /* Actual Tavus AI Avatar Video */
                      <>
                        <video
                          src={replica.thumbnail_video_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20 pointer-events-none" />
                      </>
                    ) : (
                      /* Fallback Animated Placeholder */
                      <div className="relative">
                        {/* Glowing ring effect */}
                        <div className="absolute inset-0 -m-8 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                        <div className="absolute inset-0 -m-4 rounded-full bg-primary/10 blur-xl animate-pulse delay-75" />

                        {/* Avatar Circle */}
                        <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 border-2 border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                          <Brain className="w-24 h-24 text-white/80 animate-pulse group-hover:text-primary transition-colors" strokeWidth={1} />

                          {/* Orbiting dots */}
                          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
                            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
                          </div>
                          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Call to action overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-center">
                        <p className="font-heading text-2xl uppercase text-white mb-2">Meet Your AI Guide</p>
                        <p className="font-mono text-xs text-primary uppercase tracking-widest">Click to Start →</p>
                      </div>
                    </div>
                  </div>

                  {/* HUD Overlays */}
                  <div className="absolute top-4 left-4 font-mono text-xs text-primary flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    LIVE
                  </div>
                  <div className="absolute top-4 right-4 font-mono text-[10px] text-white/50 text-right">
                    <div>TAVUS_AI // v2.4</div>
                    <div>NEURAL_INTERFACE</div>
                  </div>
                  <div className="absolute bottom-4 left-4 font-mono text-[10px] text-white/50">
                    <div>LATENCY: 12ms</div>
                    <div>MODE: STANDBY</div>
                  </div>
                  <div className="absolute bottom-4 right-4 font-mono text-xs text-white/70">CONNECTION: STABLE</div>
                </div>
              </IsoCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <TickerTape items={["ANXIETY // MANAGED", "DEPRESSION // SUPPORTED", "FOCUS // SHARPENED", "SLEEP // RESTORED", "DATA // PRIVATE"]} />

      {/* FEATURES GRID */}
      <section className="py-24 border-b border-border relative">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="font-heading text-5xl uppercase mb-4">Wellness Modules</h2>
              <p className="font-mono text-muted-foreground">Select an area for growth.</p>
            </div>
            <Terminal className="w-12 h-12 text-primary opacity-50" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Cognitive Reframing", desc: "Identify and reshape negative thought patterns gently.", icon: Brain },
              { title: "Stress Relief", desc: "Guided breathing and exercises to find calm.", icon: Activity },
              { title: "Better Sleep", desc: "Rebuild your rest rhythm naturally.", icon: Zap },
              { title: "Emotional Processing", desc: "Safe space to understand your feelings.", icon: Lock },
              { title: "Focus Tools", desc: "Clear the mind and find your flow.", icon: Target },
              { title: "Community Circle", desc: "Connect with others on similar journeys.", icon: Globe }
            ].map((feature, i) => (
              <IsoCard key={i} delay={i * 0.1}>
                <feature.icon className="w-10 h-10 text-primary mb-6" />
                <h3 className="font-heading text-2xl uppercase mb-2">{feature.title}</h3>
                <p className="text-muted-foreground font-sans leading-relaxed">{feature.desc}</p>
              </IsoCard>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-24 bg-primary text-black relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Community Members", value: "12,400+" },
              { label: "Sessions Completed", value: "85k+" },
              { label: "Wellness Score", value: "+40%" },
              { label: "Availability", value: "24/7" }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="font-heading text-5xl font-bold">{stat.value}</div>
                <div className="font-mono text-sm uppercase font-bold tracking-widest border-t-2 border-black pt-2 inline-block">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-32 mt-8 container mx-auto px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="font-heading text-6xl md:text-8xl uppercase leading-none">
            Ready to <span className="text-primary">Begin?</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Join the community. Find your balance. Own your journey.
          </p>
          <div className="flex justify-center pt-8">
            <Button3D onClick={handleStartSession} variant="primary" className="scale-125">
              Start Now
            </Button3D>
          </div>
        </div>
      </section>

    </div>
  );
}
