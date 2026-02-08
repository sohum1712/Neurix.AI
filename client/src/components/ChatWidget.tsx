import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { chatApi } from '@/utils/api';
import { AlertCircle, MessageSquare, X, Send, Sparkles } from 'lucide-react';

type ChatMessage = { role: 'user' | 'assistant'; text: string; timestamp: number };

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
    let intervalId: NodeJS.Timeout;

    if (active && loading) {
      // Animate loading text ("Thinking...")
      let i = 0;
      intervalId = setInterval(() => {
        setDisplayed(loadingText.substring(0, i + 1));
        i = (i + 1) % (loadingText.length + 1);
      }, 100);
    } else if (!loading && text) {
      // Animate actual reply typing
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

  // Toggle loading when 'active' changes
  useEffect(() => {
    if (!active) setLoading(false);
    else setLoading(true);
  }, [active]);

  return [displayed, setLoading] as [string, (value: boolean) => void];
}

function TypewriterLoadingText() {
  // Usage example: show only the loading animation "Thinking..."
  const [text] = useTypewriter({ text: "", active: true });

  return <p className="text-sm whitespace-pre-wrap break-words">{text}</p>;
}

export { useTypewriter, TypewriterLoadingText };



export default function ChatWidget() {
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: "Hello! I'm Neurix.ai, your AI companion. How can I help you today?", timestamp: Date.now() }
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
  }, [isSending]);


  const sendMessage = async () => {
    if (!canSend) return;
    const userText = chatInput.trim();
    setChatInput('');
    setIsSending(true);
    setMessages((prev) => [...prev, { role: 'user', text: userText, timestamp: Date.now() }]);
    try {
      const { data } = await chatApi.post('/chat', { message: userText });
      const reply: string = data?.reply ?? 'No reply';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply, timestamp: Date.now() }]);
      setHasError(false);
    } catch (err: any) {
      const friendly = err?.response?.data?.error || err?.message || 'Failed to send message';
      setMessages((prev) => [...prev, { role: 'assistant', text: `Error: ${friendly}`, timestamp: Date.now() }]);
      setHasError(true);
      setErrorMessage(friendly);
    } finally {
      setIsSending(false);
    }
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
      {/* Chat Toggle Button - Theme Matching */}
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
            className="absolute bottom-16 right-0 w-80 md:w-96 max-h-[60vh] bg-card/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Neurix.ai Assistant</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Online</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-background/50 max-h-[40vh]">
              <div className="space-y-4">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-white/10 text-foreground rounded-bl-sm border border-white/10'
                      }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
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
                  placeholder={isSending ? 'Sending...' : 'Type a message...'}
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