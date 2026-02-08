import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Video,
  BookOpen,
  Users,
  Settings,
  Menu,
  X,
  ArrowRight,
  LogOut,
  User,
  Globe,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TranslateWidget from './translate';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Home', href: '/', icon: Home, authRequired: false },
  { name: 'Space', href: '/dashboard', icon: Home, authRequired: true },
  { name: 'Journey', href: '/journey', icon: BookOpen, authRequired: true },
  { name: 'AI Session', href: '/tavus', icon: Video, authRequired: true },
  { name: 'Schedule', href: '/booking', icon: Calendar, authRequired: true },
  { name: 'Community', href: '/community', icon: Users, authRequired: true },
  { name: 'Library', href: '/resources', icon: BookOpen, authRequired: false },
];

export default function NavigationUniversal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Filter nav items based on auth status
  const visibleNavItems = navItems.filter(item => {
    if (item.authRequired && !user) return false;
    if (item.name === 'Home' && user) return false;
    return true;
  });

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 lg:px-12 font-mono uppercase tracking-wide text-sm">

        {/* LOGO */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold rounded-md">
            N
          </div>
          <span className="font-heading font-bold text-xl tracking-tighter text-foreground group-hover:text-primary transition-colors">
            Neurix<span className="text-primary">.ai</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center h-full">
          <div className="flex h-full border-l border-white/10">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`h-full flex items-center px-8 border-r border-white/10 transition-colors hover:bg-white hover:text-primary-foreground ${isActive(item.href) ? 'bg-white text-primary-foreground' : 'text-white/70'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE ACTIONS */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:text-primary transition-colors outline-none">
                  <span className="text-right">
                    <span className="block text-xs text-white/70">Logged in as</span>
                    <span className="font-bold">{profile?.full_name || 'Member'}</span>
                  </span>
                  <div className="w-8 h-8 bg-white/10 flex items-center justify-center border border-white/20 rounded-full">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border border-white/10 rounded-md shadow-none" align="end">
                <DropdownMenuLabel className="font-mono text-xs uppercase text-white/50">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-sm cursor-pointer font-mono text-sm hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground">
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-sm cursor-pointer font-mono text-sm hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowTranslate(!showTranslate)} className="rounded-sm cursor-pointer font-mono text-sm hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground">
                  <Globe className="mr-2 h-4 w-4" /> Translate
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleLogout} className="rounded-sm cursor-pointer font-mono text-sm text-red-400 hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate('/role')}
              className="h-10 px-6 rounded-md bg-white text-blue-900 hover:bg-blue-50 hover:text-blue-900 font-bold uppercase tracking-wider transition-all"
            >
              Start Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden flex flex-col gap-6 font-heading uppercase"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`text-3xl font-bold py-2 border-b border-white/10 ${isActive(item.href) ? 'text-primary pl-4' : 'text-foreground'
                  }`}
              >
                {item.name}
              </Link>
            ))}

            {user && (
              <>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="text-xl text-muted-foreground hover:text-white">Profile</Link>
                <Link to="/settings" onClick={() => setIsOpen(false)} className="text-xl text-muted-foreground hover:text-white">Settings</Link>
                <button onClick={handleLogout} className="text-xl text-destructive text-left">Logout</button>
              </>
            )}

            {!user && (
              <Button
                onClick={() => { navigate('/role'); setIsOpen(false); }}
                className="mt-4 rounded-md bg-primary text-primary-foreground h-14 text-xl font-bold uppercase"
              >
                Start Journey &gt;
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Translate Widget Popup */}
      {showTranslate && (
        <div className="fixed top-20 right-4 z-50 bg-background border border-white/10 p-4 shadow-2xl w-80 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-xs uppercase text-muted-foreground">System Language</span>
            <button onClick={() => setShowTranslate(false)} className="hover:text-primary"><X className="w-4 h-4" /></button>
          </div>
          <TranslateWidget inline />
        </div>
      )}
    </>
  );
}
