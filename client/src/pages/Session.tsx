import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTavus } from '@/contexts/TavusContext';
import { AlertCircle, Mic, MicOff, Video, VideoOff, PhoneOff, Settings, Sparkles, Brain } from 'lucide-react';
import { GridBackground, IsoCard } from '@/components/ui/BrutalistComponents';
import { toast } from 'sonner';

export default function Session() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const conversationUrl = searchParams.get('url');

  const {
    createConversation,
    endCurrentConversation,
    connectionStatus
  } = useTavus();

  // States
  const [initLoading, setInitLoading] = useState(!conversationUrl);
  const [loadingTime, setLoadingTime] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isEnding, setIsEnding] = useState(false);

  // 1. Initialize Conversation if URL is missing
  useEffect(() => {
    const initConversation = async () => {
      if (conversationUrl) {
        setInitLoading(false);
        return;
      }

      try {
        setInitLoading(true);
        // We start the timer here
        const { conversation_url } = await createConversation();
        navigate(`/session?url=${encodeURIComponent(conversation_url)}`, { replace: true });
      } catch (err) {
        console.error('Failed to start conversation:', err);
        // We don't show error immediately if we want the "2 minute" wait effect, 
        // asking for a 2-minute "loading" screen even if model is not present.
        // However, if createConversation fails, we have no URL. 
        // let's assume this part is fast, and the "loading" refers to the iframe connection.
        setConnectionError('Unable to route to a secure line. Please try again.');
      }
    };

    initConversation();
  }, [conversationUrl, createConversation, navigate]);


  // 2. The "2 Minute" Loading Logic
  // The user said: "if model is not their it directy show erro insted of that craete an page in which emnedded model screen and model not present show their loading not conection erro still load for 2 minutes model not found error"
  // This implies we should show a fake loading state for up to 2 minutes if the iframe doesn't load or if we detect an error (which we can't easily from iframe).
  // So we will overlay a loading screen that persists.

  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    // We'll run a timer up to 120s
    if (showLoadingOverlay) {
      interval = setInterval(() => {
        setLoadingTime(prev => {
          if (prev >= 120) {
            // Time's up
            setShowLoadingOverlay(false); // Reveal what's underneath? Or show error?
            // User said: "load for 2 minutes model not found error" -> imply showing error AFTER 2 mins.
            setConnectionError("The counsellor is currently unavailable. Please try again later.");
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showLoadingOverlay]);

  // We need a way to dismiss the loading overlay if it DOES work.
  // Since we can't detect iframe success easily, we might set a "minimum" load time (e.g. 5s)
  // then purely rely on the user seeing the content. 
  // BUT the user specifically asked for this behavior to mask the "model not found" error.
  // This implies the error happens *inside* the iframe or immediately.
  // IF the iframe shows a 404, we can't hide it easily due to cross-origin.
  // METHOD: We will keep the overlay opaque for 5-10 seconds, then fade it out? 
  // NO, the user wants it to load for 2 minutes THEN error.
  // This suggests we assume failure? Or maybe we just wait 2 minutes?
  // Let's assume the user knows the model might be missing.
  // I will make the timeout 2 minutes, but if it's working, the user can't see it? 
  // I will add a "Show Session" button that appears after maybe 10 seconds so the user can bypass if it IS working.

  const handleEndSession = useCallback(async () => {
    try {
      setIsEnding(true);
      await endCurrentConversation();
      toast.success('Session ended.');
      navigate('/dashboard');
    } catch (error) {
      navigate('/dashboard');
    }
  }, [endCurrentConversation, navigate]);

  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);


  // RENDER: ERROR STATE (After timeout)
  if (connectionError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 font-mono">
        <GridBackground />
        <IsoCard className="max-w-md w-full bg-card border border-red-500/30">
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading uppercase text-red-500 mb-2">Connection Timeout</h2>
              <p className="text-muted-foreground text-sm">{connectionError}</p>
            </div>
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-white text-black hover:bg-gray-200 rounded-none uppercase font-bold tracking-wider"
            >
              Return to Personal Space
            </Button>
          </div>
        </IsoCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-mono relative">
      <GridBackground />

      {/* HEADER - Minimal & Soft */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className={`w-2 h-2 rounded-full ${showLoadingOverlay ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
            {showLoadingOverlay ? 'Connecting to Space...' : 'Live Session'}
          </span>
        </div>
      </div>

      {/* CENTER CONTENT */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4 md:p-8">

        {/* LOADING OVERLAY (The "Embedded Model" Look) */}
        {/* We use z-index to cover the iframe while "loading" */}
        {showLoadingOverlay && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
            <div className="w-full max-w-4xl aspect-video md:aspect-[16/9] bg-card border border-white/10 relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">

              {/* Soft Pulse Animation */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-96 h-96 bg-primary rounded-full blur-[100px] animate-pulse" />
              </div>

              <div className="relative z-10 text-center space-y-8">
                {/* Icon */}
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>

                {/* Soft Copy */}
                <div>
                  <h2 className="text-2xl font-heading font-light tracking-wide mb-3">Preparing Your Space</h2>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                    We are establishing a secure, private connection with your guide. Take a moment to breathe.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-64 h-0.5 bg-white/10 mx-auto overflow-hidden relative rounded-full">
                    <div className="absolute inset-y-0 left-0 bg-primary animate-progress-indeterminate w-1/3 rounded-full" />
                  </div>
                  <p className="text-[10px] text-muted-foreground/30 font-mono uppercase tracking-widest">
                    Encryption Handshake in progress...
                  </p>
                </div>

                {/* Bypass Button (After 10s) */}
                {loadingTime > 10 && (
                  <button
                    onClick={() => setShowLoadingOverlay(false)}
                    className="text-xs text-white/30 hover:text-white transition-colors underline decoration-dotted underline-offset-4"
                  >
                    I can see the video, enter now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* IFRAME CONTAINER */}
        <div className={`w-full max-w-6xl h-full max-h-[85vh] relative transition-opacity duration-1000 ${showLoadingOverlay ? 'opacity-0' : 'opacity-100'}`}>
          <iframe
            src={conversationUrl || ''}
            allow="microphone; camera; fullscreen; display-capture"
            className="w-full h-full border border-white/10 bg-black rounded-lg shadow-2xl"
          // We try to hide loading when loaded, but if user wants visual masking for 2 mins, we rely on timeout or manual override
          />
        </div>

      </div>

      {/* CONTROLS (Only show when not loading) */}
      {!showLoadingOverlay && (
        <div
          className="absolute bottom-0 left-0 w-full p-8 z-50 flex justify-center transition-transform duration-300"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <div className={`flex items-center gap-6 bg-black/80 backdrop-blur-md p-4 px-8 border border-white/10 rounded-full transition-all duration-300 ${showControls ? 'translate-y-0' : 'translate-y-24'}`}>
            <Button
              onClick={toggleMic}
              variant="ghost"
              size="icon"
              className={`rounded-full w-12 h-12 hover:bg-white/10 transition-colors ${!isMicOn ? 'text-red-500 bg-red-500/10' : 'text-white'}`}
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              onClick={toggleVideo}
              variant="ghost"
              size="icon"
              className={`rounded-full w-12 h-12 hover:bg-white/10 transition-colors ${!isVideoOn ? 'text-red-500 bg-red-500/10' : 'text-white'}`}
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <div className="w-px h-8 bg-white/10 mx-2" />

            <Button
              onClick={handleEndSession}
              variant="destructive"
              className="rounded-full px-8 h-12 bg-red-600/90 hover:bg-red-700 font-bold uppercase tracking-wider text-xs shadow-lg shadow-red-900/20"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              End Session
            </Button>

            <div className="w-px h-8 bg-white/10 mx-2" />

            <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/10">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
