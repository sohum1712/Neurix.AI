import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTavus } from '@/contexts/TavusContext';
import { useAuth } from '@/contexts/AuthContext';
import {
    Video,
    Sparkles,
    Shield,
    Zap,
    Clock,
    ArrowRight,
    Play,
    Brain,
    Mic,
    Camera,
    CheckCircle,
    AlertCircle,
    Loader2,
    Star,
    MessageSquare,
    Heart,
    RefreshCw
} from 'lucide-react';
import {
    GridBackground,
    HUDContainer,
    IsoCard,
    Button3D,
    GlitchText,
    StatsDisplay
} from '@/components/ui/BrutalistComponents';

export default function TavusSession() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { replica, loading, error, refreshReplica, createConversation, connectionStatus } = useTavus();

    const [isStarting, setIsStarting] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Fetch replica data on mount
    useEffect(() => {
        refreshReplica().catch((err) => {
            console.error('Failed to load AI companion:', err);
            setLoadError('Unable to connect to AI companion. Please try again.');
        });
    }, [refreshReplica]);

    const handleStartSession = async () => {
        try {
            setIsStarting(true);
            setLoadError(null);
            const conversation = await createConversation();
            if (conversation?.conversation_url) {
                navigate(`/session?url=${encodeURIComponent(conversation.conversation_url)}`);
            }
        } catch (err) {
            console.error('Failed to start session:', err);
            setLoadError('Unable to start session. Please try again later.');
            setIsStarting(false);
        }
    };

    const sessionFeatures = [
        { icon: Brain, label: 'AI-Powered Conversations', desc: 'Deep, meaningful discussions with our advanced AI companion' },
        { icon: Shield, label: 'End-to-End Encryption', desc: 'Your conversations are private and secure' },
        { icon: Clock, label: 'Available 24/7', desc: 'Connect anytime, day or night' },
        { icon: Heart, label: 'Personalized Support', desc: 'Tailored responses based on your journey' },
    ];

    const previousSessions = [
        { date: '2024-03-20', duration: '45 min', mood: 'Calm', topic: 'Anxiety Management' },
        { date: '2024-03-18', duration: '30 min', mood: 'Reflective', topic: 'Sleep Patterns' },
        { date: '2024-03-15', duration: '60 min', mood: 'Optimistic', topic: 'Goal Setting' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-mono">
            <GridBackground />

            {/* HERO SECTION */}
            <div className="pt-24 pb-12 border-b border-white/10 relative z-10">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span>AI Companion Session</span>
                        </div>
                        <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase leading-[0.85] mb-6">
                            Connect <br />
                            <span className="text-primary">With Your</span> <br />
                            <GlitchText text="AI Guide" className="text-foreground" />
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                            Start a secure, private video conversation with your personalized AI wellness companion.
                            Experience meaningful support in a safe digital space.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN - AI Preview & Start */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* AI COMPANION CARD */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <IsoCard>
                                <div className="relative aspect-video bg-card border border-white/10 overflow-hidden group rounded-lg">
                                    {/* Animated Gradient Background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 opacity-50" />

                                    {/* Grid Overlay */}
                                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-10">
                                        {[...Array(48)].map((_, i) => (
                                            <div key={i} className="border border-white/20" />
                                        ))}
                                    </div>

                                    {/* AI Avatar Preview */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {loading ? (
                                            <div className="text-center space-y-4">
                                                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Initializing AI Companion...</p>
                                            </div>
                                        ) : replica?.thumbnail_video_url ? (
                                            <div className="relative w-full h-full">
                                                <video
                                                    src={replica.thumbnail_video_url}
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-6">
                                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                                                    <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-heading uppercase mb-2">Your AI Companion</h3>
                                                    <p className="text-xs text-muted-foreground">Ready to connect</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                                        <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : error ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                                        <span className="text-[10px] font-mono uppercase tracking-wider">
                                            {loading ? 'Loading...' : error ? 'Offline' : 'Online & Ready'}
                                        </span>
                                    </div>

                                    {/* HUD Corner Overlays */}
                                    <div className="absolute top-4 right-4 text-[10px] font-mono text-white/50 text-right">
                                        <div>TAVUS // v2.4</div>
                                        <div>SECURE_CHANNEL</div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-[10px] font-mono text-white/50">
                                        <div>LATENCY: 12ms</div>
                                        <div>ENCRYPTION: AES-256</div>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                    <Button3D
                                        onClick={handleStartSession}
                                        variant="primary"
                                        className="flex-1 justify-center"
                                        disabled={isStarting || loading}
                                    >
                                        {isStarting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                Start Session
                                            </>
                                        )}
                                    </Button3D>
                                    <Button3D
                                        onClick={() => refreshReplica()}
                                        variant="outline"
                                        className="sm:w-auto justify-center"
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button3D>
                                </div>

                                {/* Error Display */}
                                <AnimatePresence>
                                    {(loadError || error) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-md flex items-start gap-3"
                                        >
                                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-red-400 font-medium">{loadError || error}</p>
                                                <p className="text-xs text-red-400/70 mt-1">Please check your connection and try again.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </IsoCard>
                        </motion.div>

                        {/* PRE-SESSION CHECKLIST */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <HUDContainer title="Pre-Session Checklist">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        { icon: Mic, label: 'Microphone Access', status: 'ready' },
                                        { icon: Camera, label: 'Camera Access', status: 'ready' },
                                        { icon: Shield, label: 'Secure Connection', status: 'ready' },
                                        { icon: Zap, label: 'Low Latency', status: 'ready' },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-md"
                                        >
                                            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                                <item.icon className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{item.label}</p>
                                                <p className="text-[10px] text-emerald-500 uppercase tracking-wider">Ready</p>
                                            </div>
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        </div>
                                    ))}
                                </div>
                            </HUDContainer>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN - Features & History */}
                    <div className="lg:col-span-5 space-y-8">

                        {/* FEATURES */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <HUDContainer title="Session Features">
                                <div className="space-y-4">
                                    {sessionFeatures.map((feature, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-colors group"
                                        >
                                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <feature.icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm uppercase mb-1">{feature.label}</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </HUDContainer>
                        </motion.div>

                        {/* SESSION HISTORY */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <HUDContainer title="Recent Sessions">
                                <div className="space-y-3">
                                    {previousSessions.map((session, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                                    <MessageSquare className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{session.topic}</p>
                                                    <p className="text-[10px] text-muted-foreground">{session.date} • {session.duration}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block px-2 py-0.5 bg-white/10 text-[10px] uppercase rounded-full">
                                                    {session.mood}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="mt-4 text-xs text-primary hover:underline uppercase tracking-wider w-full text-center">
                                    View Full History →
                                </button>
                            </HUDContainer>
                        </motion.div>

                        {/* QUICK STATS */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <HUDContainer className="bg-card">
                                    <StatsDisplay label="Total Sessions" value="47" direction="up" trend="+5" />
                                </HUDContainer>
                                <HUDContainer className="bg-card">
                                    <StatsDisplay label="Hours Talked" value="24h" direction="up" trend="+3h" />
                                </HUDContainer>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
}
