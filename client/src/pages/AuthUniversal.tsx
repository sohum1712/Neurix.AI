import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { User, Lock, ArrowLeft, Mail, Command, Shield, AlertTriangle, CheckCircle, Terminal, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  GridBackground,
  HUDContainer,
  Button3D,
  IsoCard,
  GlitchText
} from '@/components/ui/BrutalistComponents';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'update-password' | 'verify' | 'reset-password';

// Helper function to determine auth mode from path and query params
function getAuthMode(pathname: string, searchParams: URLSearchParams): AuthMode {
  // Check query params first
  const modeParam = searchParams.get('mode');
  if (modeParam) {
    return modeParam as AuthMode;
  }

  // Check path-based routing
  if (pathname === '/reset-password' || pathname === '/forgot-password') {
    return 'forgot-password';
  }
  if (pathname === '/update-password') {
    return 'update-password';
  }
  if (pathname === '/signup') {
    return 'signup';
  }
  if (pathname === '/login') {
    return 'login';
  }

  return 'login';
}

export default function AuthUniversal() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const mode = getAuthMode(location.pathname, searchParams);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, resetPassword, updatePassword, user } = useAuth();

  // Redirect if already logged in (except for password update/reset flows)
  useEffect(() => {
    if (user && mode !== 'update-password' && mode !== 'verify' && mode !== 'forgot-password' && mode !== 'reset-password') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, mode, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) throw new Error("PASSWORDS_DO_NOT_MATCH");
        const { data, error } = await signUp(email, password, fullName);
        if (error) throw error;
        if (data.user) {
          setSuccess('ACCOUNT_CREATED // CHECK_EMAIL_VERIFICATION');
          setTimeout(() => navigate('/auth?mode=verify'), 2000);
        }
      } else if (mode === 'login') {
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        if (data.user) {
          setSuccess('AUTHENTICATION_SUCCESSFUL // REDIRECTING...');
          navigate('/dashboard', { replace: true });
        }
      } else if (mode === 'forgot-password' || mode === 'reset-password') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccess('RESET_LINK_SENT // CHECK_INBOX');
      } else if (mode === 'update-password') {
        if (password.length < 6) throw new Error("PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS");
        if (password !== confirmPassword) throw new Error("PASSWORDS_DO_NOT_MATCH");
        const { error } = await updatePassword(password);
        if (error) throw error;
        setSuccess('PASSWORD_UPDATED_SUCCESSFULLY // REDIRECTING...');
        setTimeout(() => navigate('/auth?mode=login'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'SYSTEM_ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'New_User_Registration';
      case 'forgot-password':
      case 'reset-password': return 'Password_Reset_Protocol';
      case 'update-password': return 'Credential_Update';
      case 'verify': return 'Identity_Verification';
      default: return 'System_Entry';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col relative overflow-hidden">
      <GridBackground />

      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 border-b border-white/10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="w-5 h-5" />
          <span className="font-bold tracking-widest text-sm">NEURIX_SECURE_GATEWAY</span>
        </div>
        <Link to="/" className="text-xs uppercase hover:text-primary transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Base
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <IsoCard className="max-w-md w-full">
          <div className="p-8">

            {/* TERMINAL HEADER */}
            <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
              <Terminal className="w-6 h-6 text-primary" />
              <div>
                <h1 className="font-heading text-2xl uppercase leading-none">{getTitle()}</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  SECURE CONNECTION ESTABLISHED
                </p>
              </div>
            </div>

            {/* ALERTS */}
            {error && (
              <div className="mb-6 p-3 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="font-bold">{error.toUpperCase()}</span>
              </div>
            )} {success && (
              <div className="mb-6 p-3 border border-green-500/50 bg-green-500/10 flex items-center gap-3 text-green-500 text-xs">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-bold">{success}</span>
              </div>
            )}

            {/* FORM */}
            {mode === 'verify' ? (
              <div className="text-center space-y-6">
                <Mail className="w-16 h-16 text-primary mx-auto animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  Verification packet sent to secure inbox. <br /> Acknowledge receipt to proceed.
                </p>
                <Button3D onClick={() => navigate('/auth?mode=login')} variant="primary" className="w-full">
                  Return to Login
                </Button3D>
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-5">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-muted-foreground tracking-widest">Full_Name</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 h-10 pl-10 pr-4 text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/30"
                        placeholder="OPERATOR_NAME"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {mode !== 'update-password' && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-muted-foreground tracking-widest">Email_Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 h-10 pl-10 pr-4 text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/30"
                        placeholder="USER@DOMAIN.COM"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {mode !== 'forgot-password' && mode !== 'reset-password' && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-muted-foreground tracking-widest">
                      {mode === 'update-password' ? 'New_Passcode' : 'Passcode'}
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 h-10 pl-10 pr-4 text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/30"
                        placeholder="••••••••••••"
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {(mode === 'signup' || mode === 'update-password') && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-muted-foreground tracking-widest">Confirm_Passcode</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 h-10 pl-10 pr-4 text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/30"
                        placeholder="••••••••••••"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <Link to="/auth?mode=forgot-password" className="text-[10px] uppercase text-primary hover:underline tracking-wider">
                      Recover_Credentials?
                    </Link>
                  </div>
                )}

                <Button3D
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'PROCESSING...' : 'EXECUTE'}
                </Button3D>
              </form>
            )}

            {/* OAUTH */}
            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="relative my-6 text-center">
                  <span className="bg-background px-2 text-[10px] uppercase text-muted-foreground relative z-10">Or Initialize With</span>
                  <div className="absolute inset-0 top-1/2 border-t border-white/10 -z-0" />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button3D onClick={signInWithGoogle} variant="outline" className="w-full justify-center">
                    <Command className="w-4 h-4 mr-2" /> GOOGLE_ID
                  </Button3D>
                </div>
              </>
            )}

            {/* FOOTER NAV */}
            <div className="mt-8 text-center text-xs text-muted-foreground">
              {mode === 'login' && (
                <div>
                  No Clearance?{' '}
                  <Link to="/auth?mode=signup" className="text-primary hover:underline uppercase font-bold">
                    Request_Access
                  </Link>
                </div>
              )}
              {mode === 'signup' && (
                <div>
                  Existing ID?{' '}
                  <Link to="/auth?mode=login" className="text-primary hover:underline uppercase font-bold">
                    User_Login
                  </Link>
                </div>
              )}
              {(mode === 'forgot-password' || mode === 'update-password') && (
                <Link to="/auth?mode=login" className="text-primary hover:underline uppercase font-bold">
                  Return_To_Login
                </Link>
              )}
            </div>

          </div>
        </IsoCard>
      </div>

      {/* FOOTER STATUS */}
      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/5 bg-background/50 backdrop-blur-sm flex justify-between items-center text-[10px] text-muted-foreground font-mono uppercase">
        <div>SYSTEM_ID: NEURIX_V2.4</div>
        <div>ENCRYPTION: AES-256</div>
      </div>

    </div>
  );
}
