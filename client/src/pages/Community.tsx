import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  MessageSquare,
  Heart,
  Share2,
  Flag,
  Search,
  Filter,
  Plus,
  Users,
  Hash,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  HUDContainer,
  GridBackground,
  Button3D
} from '@/components/ui/BrutalistComponents';

interface Post {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: { name: 'Mindful_User_88', role: 'Member' },
    content: "Just completed a 30-day mindfulness streak. The clarity I feel is amazing. Highly recommend the 'Deep Focus' journey.",
    tags: ['Mindfulness', 'Success'],
    likes: 24,
    comments: 5,
    timestamp: '2h ago',
    isLiked: false
  },
  {
    id: '2',
    author: { name: 'Wellness_Guide', role: 'Moderator' },
    content: "New anxiety regulation exercises are now available. Check your dashboard for the 'Calm & Center' update.",
    tags: ['Update', 'Wellness'],
    likes: 156,
    comments: 12,
    timestamp: '5h ago',
    isLiked: true
  },
  {
    id: '3',
    author: { name: 'Anon_7734', role: 'Member' },
    content: "Struggling with sleep lately. Anyone have tips for winding down without screens?",
    tags: ['Sleep', 'Support'],
    likes: 8,
    comments: 23,
    timestamp: '1d ago',
    isLiked: false
  }
];

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [filter, setFilter] = useState('ALL');

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <GridBackground />

      {/* HEADER SECTION */}
      <div className="pt-24 pb-12 border-b border-border bg-background/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest mb-2">
                <Users className="w-3 h-3" />
                Community Hub
              </div>
              <h1 className="font-heading text-6xl md:text-7xl font-bold uppercase leading-[0.85] mb-4">
                Community <br />
                <span className="text-primary">Circle</span>
              </h1>
              <p className="text-muted-foreground max-w-xl border-l-2 border-primary pl-4">
                A safe space to connect and share experiences.
              </p>
            </div>

            <Button3D variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button3D>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR - FILTERS */}
          <div className="lg:col-span-3 space-y-8">
            <HUDContainer title="Topics" className="sticky top-24">
              <div className="space-y-2">
                {['ALL', 'ANNOUNCEMENTS', 'JOURNEYS', 'SUPPORT'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`w-full text-left px-4 py-3 border border-transparent hover:border-primary hover:bg-primary/10 transition-all font-mono text-sm uppercase flex justify-between items-center group ${filter === f ? 'bg-primary text-black font-bold border-primary' : 'text-muted-foreground'
                      }`}
                  >
                    {f}
                    {filter === f && <span className="animate-pulse">●</span>}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-xs uppercase text-muted-foreground mb-4">Trending</h3>
                <div className="flex flex-wrap gap-2">
                  {['#Anxiety', '#Sleep', '#Focus', '#Gratitude', '#SelfCare'].map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 text-xs hover:border-primary cursor-pointer transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </HUDContainer>
          </div>

          {/* MAIN FEED */}
          <div className="lg:col-span-9 space-y-6">

            {/* SEARCH BAR */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search interactions..."
                  className="w-full bg-black border border-border h-12 pl-12 pr-4 text-sm font-mono focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
              <Button className="h-12 w-12 rounded-none border border-border bg-black hover:bg-white hover:text-black transition-colors">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* POSTS */}
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative border-l-2 border-border pl-6 py-2 hover:border-primary transition-colors"
              >
                {/* Connector Line */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />

                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white/10 flex items-center justify-center border border-white/20 rounded-full">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{post.author.name}</span>
                      <span className="text-[10px] bg-white/10 px-1 text-muted-foreground uppercase rounded-sm">{post.author.role}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{post.timestamp}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-card border border-border p-6 mb-4 relative hover:bg-white/5 transition-colors rounded-lg">
                  <div className="absolute top-0 right-0 p-2 opacity-20">
                    <Hash className="w-12 h-12" />
                  </div>
                  <p className="text-base leading-relaxed text-foreground/90 font-sans relative z-10">
                    {post.content}
                  </p>

                  <div className="flex gap-2 mt-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs text-primary font-mono font-bold">
                        [{tag}]
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 hover:text-primary transition-colors ${post.isLiked ? 'text-primary' : ''}`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-primary' : ''}`} />
                    <span className="font-mono">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-white transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-mono">{post.comments}</span>
                  </button>
                  <button className="ml-auto hover:text-white transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="hover:text-red-500 transition-colors">
                    <Flag className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
