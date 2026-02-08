import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { chatApi } from '@/utils/api';
import {
  AlertCircle,
  MessageSquare,
  X,
  Send,
  Sparkles,
  Heart,
  Phone,
  Brain,
  HelpCircle,
  Wind,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Types for enhanced AI response
interface EmotionData {
  detected: string;
  intensity: number;
  confidence: number;
  secondary: string[];
  trajectory: string;
}

interface SafetyData {
  risk_level: 'low' | 'medium' | 'high' | 'crisis';
  needs_intervention: boolean;
  intervention_type: string;
}

interface CrisisData {
  show_helpline: boolean;
  helplines: {
    primary: {
      name: string;
      number: string;
      toll_free: string;
      available: string;
      website: string;
    };
    secondary: Array<{ name: string; number: string; hours: string }>;
  };
  grounding_exercise: {
    name: string;
    instructions: string;
  } | null;
  message_tone: string;
}

interface ExplanationData {
  was_refined: boolean;
  safety_verified: boolean;
  confidence: number;
}

interface EnhancedChatResponse {
  reply: string;
  sessionId: string;
  emotion: EmotionData;
  safety: SafetyData;
  therapy: {
    style_used: string;
    reasoning: string;
  };
  suggestions: {
    followups: string[];
    resources: any;
  };
  crisis?: CrisisData;
  explanation?: ExplanationData;
  multiAgent?: {
    used: boolean;
    processingTime?: number;
    agentInsights?: {
      therapist: { name: string; icon: string; confidence: number; active: boolean };
      risk: { name: string; icon: string; confidence: number; active: boolean };
      planner: { name: string; icon: string; confidence: number; active: boolean };
      ethics: { name: string; icon: string; confidence: number; active: boolean };
    };
    confidence?: number;
  };
}

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  emotion?: EmotionData;
  safety?: SafetyData;
  showExplanation?: boolean;
  multiAgent?: {
    used: boolean;
    agentInsights?: any;
    confidence?: number;
  };
};

// Typewriter effect hook
function useTypewriter({
  text,
  loadingText = "Thinking...",
  active,
}: {
  text: string;
  loadingText?: string;
  active: boolean;
}) {
  const [displayed, setDisplayed] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (active && loading) {
      let i = 0;
      intervalId = setInterval(() => {
        setDisplayed(loadingText.substring(0, i + 1));
        i = (i + 1) % (loadingText.length + 1);
      }, 100);
    } else if (!loading && text) {
      let idx = 0;
      setDisplayed("");
      intervalId = setInterval(() => {
        setDisplayed((prev) => text.substring(0, idx + 1));
        idx++;
        if (idx > text.length) clearInterval(intervalId);
      }, 20);
    }

    return () => clearInterval(intervalId);
  }, [active, loading, text, loadingText]);

  useEffect(() => {
    if (!active) setLoading(false);
    else setLoading(true);
  }, [active]);

  return [displayed, setLoading] as [string, (value: boolean) => void];
}

function TypewriterLoadingText() {
  const [text] = useTypewriter({ text: "", active: true });
  return <p className="text-sm whitespace-pre-wrap break-words">{text}</p>;
}

export { useTypewriter, TypewriterLoadingText };

// Emotion indicator component
function EmotionIndicator({ emotion, intensity }: { emotion: string; intensity: number }) {
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
  };

  return (
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
      <span>{emotionEmojis[emotion] || '💭'}</span>
      <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${emotionColors[emotion] || 'bg-gray-400'} transition-all duration-300`}
          style={{ width: `${intensity * 100}%` }}
        />
      </div>
    </div>
  );
}

// Crisis Alert Component
function CrisisAlert({ crisisData, onClose }: { crisisData: CrisisData; onClose: () => void }) {
  const [showExercise, setShowExercise] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 bg-card/98 backdrop-blur-md rounded-xl p-4 flex flex-col z-50 border border-red-500/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <Heart className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="font-bold text-foreground">We're Here For You</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        <p className="text-sm text-muted-foreground">
          Your feelings are valid, and you don't have to face this alone. Help is available.
        </p>

        {/* Helpline */}
        {crisisData.helplines && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">{crisisData.helplines.primary.name}</span>
            </div>
            <a
              href={`tel:${crisisData.helplines.primary.toll_free}`}
              className="text-2xl font-bold text-primary hover:underline block mb-1"
            >
              {crisisData.helplines.primary.toll_free}
            </a>
            <p className="text-[10px] text-muted-foreground">
              Available {crisisData.helplines.primary.available}
            </p>
          </div>
        )}

        {/* Grounding Exercise */}
        {crisisData.grounding_exercise && (
          <div className="bg-white/5 border border-white/10 rounded-lg">
            <button
              onClick={() => setShowExercise(!showExercise)}
              className="w-full p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-sm">Grounding Exercise</span>
              </div>
              {showExercise ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {showExercise && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3 pb-3 overflow-hidden"
                >
                  <h4 className="font-semibold text-sm mb-2">{crisisData.grounding_exercise.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {crisisData.grounding_exercise.instructions}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Other helplines */}
        {crisisData.helplines?.secondary && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Other Resources</p>
            {crisisData.helplines.secondary.map((helpline, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span>{helpline.name}</span>
                <a href={`tel:${helpline.number}`} className="text-primary hover:underline">
                  {helpline.number}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back button */}
      <button
        onClick={onClose}
        className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
      >
        Back to Chat
      </button>
    </motion.div>
  );
}

// Why did AI say this? Modal
function ExplanationBadge({ therapy }: { therapy: { style_used: string; reasoning: string } }) {
  const [showDetail, setShowDetail] = useState(false);

  const styleLabels: Record<string, string> = {
    CBT: 'Cognitive Behavioral',
    supportive: 'Supportive Listening',
    mindfulness: 'Mindfulness',
    motivational: 'Motivational Coaching',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetail(!showDetail)}
        className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors"
      >
        <Brain className="w-3 h-3" />
        <span>{styleLabels[therapy.style_used] || therapy.style_used}</span>
      </button>

      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-card border border-white/10 rounded-lg shadow-xl z-10"
          >
            <p className="text-[10px] text-muted-foreground">{therapy.reasoning}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



export default function ChatWidget() {
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [currentCrisisData, setCurrentCrisisData] = useState<CrisisData | null>(null);
  const [latestTherapy, setLatestTherapy] = useState<{ style_used: string; reasoning: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "Hello! I'm Neurix.ai, your AI wellness companion. I'm here to listen and support you. How are you feeling today?",
      timestamp: Date.now()
    }
  ]);

  const canSend = useMemo(() => chatInput.trim().length > 0 && !isSending, [chatInput, isSending]);

  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showChat, messages]);

  const lastAssistantMsgIdx = messages.map(m => m.role).lastIndexOf('assistant');
  const lastAssistantMsg = messages[lastAssistantMsgIdx];
  const [typewriterText, setTypewriterLoading] = useTypewriter({
    text: lastAssistantMsg?.text || '',
    active: isSending,
  });

  useEffect(() => {
    if (!isSending) setTypewriterLoading(false);
  }, [isSending, setTypewriterLoading]);


  const sendMessage = async () => {
    if (!canSend) return;
    const userText = chatInput.trim();
    setChatInput('');
    setIsSending(true);
    setMessages((prev) => [...prev, { role: 'user', text: userText, timestamp: Date.now() }]);

    try {
      // Use enhanced chatbot endpoint
      const { data } = await chatApi.post<EnhancedChatResponse>('/chatbot/chat', {
        message: userText,
        sessionId: sessionId || undefined
      });

      const reply: string = data?.reply ?? 'No reply';

      // Save session ID for conversation continuity
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      // Update therapy style
      if (data.therapy) {
        setLatestTherapy(data.therapy);
      }

      // Add assistant message with metadata
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: reply,
        timestamp: Date.now(),
        emotion: data.emotion,
        safety: data.safety,
        multiAgent: data.multiAgent
      }]);

      // Handle crisis situation
      if (data.crisis && data.safety?.needs_intervention) {
        setCurrentCrisisData(data.crisis);
        // Only auto-show for high/crisis levels
        if (data.safety.risk_level === 'high' || data.safety.risk_level === 'crisis') {
          setShowCrisisAlert(true);
        }
      }

      setHasError(false);
    } catch (err: any) {
      const friendly = err?.response?.data?.error || err?.message || 'Failed to send message';
      const fallbackReply = err?.response?.data?.reply || `I'm having trouble connecting. Please try again.`;
      setMessages((prev) => [...prev, { role: 'assistant', text: fallbackReply, timestamp: Date.now() }]);
      setHasError(true);
      setErrorMessage(friendly);
    } finally {
      setIsSending(false);
    }
  };

  // Suggestion button click handler
  const handleSuggestionClick = (suggestion: string) => {
    setChatInput(suggestion);
  };

  // If there's a critical error loading the component, show minimal UI
  if (hasError && messages.length === 1) {
    return (
      <div className="fixed bottom-32 right-6 z-50">
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform group"
          aria-label="Chat unavailable"
        >
          <AlertCircle className="w-6 h-6 text-red-400" />
        </button>

        {showChat && (
          <div className="absolute bottom-16 right-0 w-80 bg-card/95 backdrop-blur-md rounded-xl shadow-2xl p-4 border border-red-500/20">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Chat Unavailable</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The AI companion is temporarily unavailable. Please try again later.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-32 right-6 z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className={`w-14 h-14 rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-300 group border ${showChat
          ? 'bg-primary border-primary rotate-0'
          : 'bg-card/80 border-white/20 hover:bg-primary/20 hover:border-primary/50 hover:scale-110'
          }`}
        aria-label="Toggle chat"
      >
        {showChat ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-primary" />
            <Sparkles className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-pulse" />
          </div>
        )}
      </button>

      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-80 md:w-96 max-h-[70vh] bg-card/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
          >
            {/* Crisis Alert Overlay */}
            <AnimatePresence>
              {showCrisisAlert && currentCrisisData && (
                <CrisisAlert
                  crisisData={currentCrisisData}
                  onClose={() => setShowCrisisAlert(false)}
                />
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Neurix.ai Assistant</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Online</p>
                    {latestTherapy && (
                      <ExplanationBadge therapy={latestTherapy} />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Crisis resources quick access */}
                {currentCrisisData && (
                  <button
                    onClick={() => setShowCrisisAlert(true)}
                    className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                    title="Emergency Resources"
                  >
                    <Phone className="w-3.5 h-3.5 text-red-400" />
                  </button>
                )}
                <button
                  onClick={() => setShowChat(false)}
                  className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-background/50 max-h-[45vh]">
              <div className="space-y-4">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${m.role === 'user' ? '' : 'space-y-1'}`}>
                      <div className={`p-3 rounded-2xl shadow-sm ${m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-white/10 text-foreground rounded-bl-sm border border-white/10'
                        }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                        
                        {/* Multi-Agent Indicator */}
                        {m.role === 'assistant' && m.multiAgent?.used && (
                          <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              <span className="text-[9px] font-mono text-muted-foreground">Multi-Agent</span>
                            </div>
                            {m.multiAgent.confidence && (
                              <span className="text-[9px] font-mono text-primary">
                                {(m.multiAgent.confidence * 100).toFixed(0)}% confidence
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Emotion indicator for user messages */}
                      {m.role === 'user' && m.emotion && (
                        <div className="flex justify-end mt-1">
                          <EmotionIndicator emotion={m.emotion.detected} intensity={m.emotion.intensity} />
                        </div>
                      )}

                      {/* Safety indicator for concerning messages */}
                      {m.role === 'user' && m.safety && m.safety.risk_level !== 'low' && (
                        <div className="flex justify-end mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${m.safety.risk_level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              m.safety.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                            {m.safety.risk_level === 'medium' ? '💛 Checking in' :
                              m.safety.risk_level === 'high' ? '🧡 Support available' :
                                '❤️ We\'re here for you'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-card/50">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  placeholder={isSending ? 'Thinking...' : 'Type a message...'}
                  className="flex-1 bg-white/5 border border-white/10 text-foreground rounded-full py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                  disabled={isSending}
                />
                <button
                  aria-label="Send message"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${canSend
                    ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                    : 'bg-white/5 text-muted-foreground cursor-not-allowed'
                    }`}
                  onClick={sendMessage}
                  disabled={!canSend}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}