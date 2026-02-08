import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Mail,
  Shield,
  Edit2,
  Camera,
  Save,
  BookOpen,
  Sparkles
} from 'lucide-react';
import {
  HUDContainer,
  GridBackground,
  IsoCard,
  Button3D,
  StatsDisplay
} from '@/components/ui/BrutalistComponents';

export default function Profile() {
  const { user, profile, uploadAvatar } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = {
    sessions: 47,
    hours: 24.5,
    streak: 12,
    level: 5
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar(file);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <GridBackground />

      {/* HEADER */}
      <div className="pt-24 pb-12 border-b border-border bg-background/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest mb-2">
                <BookOpen className="w-3 h-3" />
                Member Profile
              </div>
              <h1 className="font-heading text-6xl font-bold uppercase leading-[0.85] mb-4">
                My <br />
                <span className="text-primary">Journey</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* LEFT COLUMN - AVATAR & ID */}
          <div className="lg:col-span-4 space-y-8">
            <IsoCard className="bg-white/5">
              <div className="relative aspect-square border-2 border-primary/20 bg-white/5 overflow-hidden group rounded-lg">
                <img
                  src={profile?.avatar_url || "https://github.com/shadcn.png"}
                  alt="Profile"
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                />

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button3D onClick={handleAvatarClick} variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Update Photo
                  </Button3D>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary" />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs uppercase text-muted-foreground">Member ID</span>
                  <span className="text-xs font-mono text-primary truncate max-w-[150px]">{user?.id}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs uppercase text-muted-foreground">Status</span>
                  <span className="text-xs font-mono text-white bg-white/10 px-2 py-0.5 rounded-full">Active Member</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs uppercase text-muted-foreground">Since</span>
                  <span className="text-xs font-mono text-white">2024</span>
                </div>
              </div>
            </IsoCard>
          </div>

          {/* RIGHT COLUMN - DETAILS & STATS */}
          <div className="lg:col-span-8 space-y-8">

            {/* PERSONAL DATA */}
            <HUDContainer title="Personal Details">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground block">Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <input
                      type="text"
                      value={fullName}
                      disabled={!isEditing}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/5 border border-border h-12 pl-10 pr-4 font-mono text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-primary focus:outline-none transition-colors rounded-md"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-white/5 border border-border h-12 pl-10 pr-4 font-mono text-muted-foreground opacity-50 cursor-not-allowed rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                {isEditing ? (
                  <Button3D onClick={() => setIsEditing(false)} variant="primary">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button3D>
                ) : (
                  <Button3D onClick={() => setIsEditing(true)} variant="outline">
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                  </Button3D>
                )}
              </div>
            </HUDContainer>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <HUDContainer className="bg-card">
                <StatsDisplay label="Sessions" value={stats.sessions} direction="up" trend="+2" />
              </HUDContainer>
              <HUDContainer className="bg-card">
                <StatsDisplay label="Hours" value={`${stats.hours}h`} direction="neutral" trend="--" />
              </HUDContainer>
              <HUDContainer className="bg-card">
                <StatsDisplay label="Streak" value={stats.streak} direction="up" trend="Days" />
              </HUDContainer>
              <HUDContainer className="bg-card">
                <StatsDisplay label="Progress" value={`Lvl ${stats.level}`} direction="up" trend="Rising" />
              </HUDContainer>
            </div>

            {/* ACTIVITY LOG */}
            <HUDContainer title="Recent Activity">
              <div className="space-y-3 font-mono text-xs">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-primary rounded-r-md">
                    <div className="text-muted-foreground">2024-02-0{8 - i}</div>
                    <div className="text-primary font-bold">SESSION COMPLETE</div>
                    <div className="text-white">Topic: Mindfulness Basics</div>
                  </div>
                ))}
              </div>
            </HUDContainer>

          </div>
        </div>
      </div>
    </div>
  );
}