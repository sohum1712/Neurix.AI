import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Sparkles, Heart, Brain, Leaf, Sun, Moon, Wind, Droplets, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Wellness tips with icons for stress and anxiety relief
const wellnessTips = [
  {
    icon: Wind,
    title: "4-7-8 Breathing",
    tip: "Breathe in for 4 seconds, hold for 7, exhale for 8. This activates your parasympathetic nervous system instantly.",
    color: "from-blue-500/20 to-cyan-500/20"
  },
  {
    icon: Droplets,
    title: "Cold Water Reset",
    tip: "Splash cold water on your face or hold ice cubes. This triggers the dive reflex and calms your heart rate immediately.",
    color: "from-cyan-500/20 to-blue-500/20"
  },
  {
    icon: Brain,
    title: "5-4-3-2-1 Grounding",
    tip: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Anchors you to the present moment.",
    color: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: Heart,
    title: "Self-Compassion Pause",
    tip: "Place your hand on your heart. Say: 'This is hard, but I can handle this.' Feel the warmth spread through your chest.",
    color: "from-rose-500/20 to-red-500/20"
  },
  {
    icon: Leaf,
    title: "Nature Visualization",
    tip: "Close your eyes. Imagine a peaceful forest, beach, or mountain. Breathe in the imaginary fresh air for 30 seconds.",
    color: "from-green-500/20 to-emerald-500/20"
  },
  {
    icon: Sun,
    title: "Sunshine Stretch",
    tip: "Stand up, reach your arms high, stretch to each side. Even 30 seconds of movement releases tension from your body.",
    color: "from-yellow-500/20 to-orange-500/20"
  },
  {
    icon: Moon,
    title: "Progressive Relaxation",
    tip: "Tense your shoulders for 5 seconds, then release. Do the same with fists, face, and toes. Feel the tension melt away.",
    color: "from-indigo-500/20 to-purple-500/20"
  },
  {
    icon: Music,
    title: "Hum or Sing",
    tip: "Humming stimulates the vagus nerve and reduces cortisol. Try humming your favorite song for instant calm.",
    color: "from-pink-500/20 to-rose-500/20"
  },
  {
    icon: Sparkles,
    title: "Gratitude Flash",
    tip: "Think of 3 things you're grateful for right now. Gratitude shifts brain chemistry from anxiety to calm within seconds.",
    color: "from-amber-500/20 to-yellow-500/20"
  },
  {
    icon: Brain,
    title: "Butterfly Hug",
    tip: "Cross your arms, hands on shoulders. Tap alternately left-right 10 times. This bilateral stimulation soothes anxiety.",
    color: "from-violet-500/20 to-indigo-500/20"
  }
];

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Auth Callback Page
 * Handles OAuth redirects from Google, GitHub, etc.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [shuffledTips] = useState(() => shuffleArray(wellnessTips));

  // Rotate tips every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % shuffledTips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [shuffledTips.length]);

  // If user is authenticated, redirect immediately
  useEffect(() => {
    if (user && !error && hasProcessed) {
      console.log('✅ User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, error, hasProcessed, navigate]);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('=== AuthCallback: Starting ===');
        console.log('Current URL:', window.location.href);

        // Wait for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the session
        console.log('Getting session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log('Session result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          email: session?.user?.email,
          error: sessionError
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error(`Session error: ${sessionError.message}`);
        }

        if (!session) {
          console.error('No session found after OAuth callback');
          throw new Error('No session found. Please try logging in again.');
        }

        if (!session.user) {
          console.error('Session exists but no user');
          throw new Error('Invalid session. Please try logging in again.');
        }

        console.log('✅ User authenticated:', session.user.email);

        // Try to get or create profile
        try {
          console.log('Checking if profile exists...');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          console.log('Profile check result:', {
            hasProfile: !!profileData,
            error: profileError
          });

          // Create profile if it doesn't exist
          if (!profileData && !profileError) {
            console.log('Creating new profile...');

            const newProfile = {
              id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email?.split('@')[0] ||
                'User',
              avatar_url: session.user.user_metadata?.avatar_url ||
                session.user.user_metadata?.picture ||
                null,
            };

            console.log('Profile data:', newProfile);

            const { error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              console.warn('Continuing without profile creation');
            } else {
              console.log('✅ Profile created successfully');
            }
          } else if (profileData) {
            console.log('✅ Profile already exists');
          } else if (profileError) {
            console.error('Profile error:', profileError);
            console.warn('Continuing despite profile error');
          }
        } catch (profileErr) {
          console.error('Profile operation failed:', profileErr);
          console.warn('Continuing to dashboard despite profile error');
        }

        // Mark processing as complete
        setHasProcessed(true);

        console.log('✅ Processing complete, waiting for user state...');

      } catch (err: any) {
        console.error('=== Auth callback error ===');
        console.error('Error:', err);
        console.error('Error message:', err.message);

        setError(err.message || 'Authentication failed');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          console.log('Redirecting to login due to error');
          navigate('/auth?mode=login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  const currentTip = shuffledTips[currentTipIndex];
  const TipIcon = currentTip.icon;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {error}
            <br />
            <span className="text-sm mt-2 block">Redirecting to login...</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-lg w-full text-center space-y-8">

        {/* Wellness Tip Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTipIndex}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`bg-gradient-to-br ${currentTip.color} backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl`}
          >
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <TipIcon className="w-8 h-8 text-primary" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-foreground mb-3 font-heading uppercase tracking-wide">
              {currentTip.title}
            </h3>

            {/* Tip text */}
            <p className="text-muted-foreground leading-relaxed text-sm">
              {currentTip.tip}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-6">
              {shuffledTips.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentTipIndex
                      ? 'bg-primary w-6'
                      : 'bg-white/20'
                    }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Loading section */}
        <div className="space-y-6">
          {/* Custom loading animation */}
          <div className="flex items-center justify-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-8 bg-primary rounded-full"
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Status text */}
          <div className="space-y-2">
            <p className="text-foreground font-mono text-sm uppercase tracking-widest">
              {hasProcessed ? 'Redirecting to your space...' : 'Completing authentication...'}
            </p>
            <p className="text-muted-foreground text-xs">
              {hasProcessed ? 'Almost there!' : 'Setting up your wellness journey'}
            </p>
          </div>

          {/* Breathing prompt */}
          <motion.p
            className="text-primary/70 text-xs font-mono"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ✨ Take a deep breath while you wait ✨
          </motion.p>
        </div>
      </div>
    </div>
  );
}
