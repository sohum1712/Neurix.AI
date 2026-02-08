import { useState } from 'react';
import {
  BookOpen,
  Video,
  Headphones,
  FileText,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Lock,
  Clock
} from 'lucide-react';
import {
  GridBackground,
  IsoCard,
  HUDContainer
} from '@/components/ui/BrutalistComponents';

const resources = [
  {
    id: 1,
    title: "Anxiety Regulation Guide",
    type: "Guide",
    category: "Anxiety",
    duration: "15 min read",
    description: "Gentle techniques for managing stress responses and finding your center.",
    accessLevel: "Open"
  },
  {
    id: 2,
    title: "Deep Rest Audio",
    type: "Audio",
    category: "Sleep",
    duration: "45 min",
    description: "Soothing soundscapes designed to help you drift into deep, restorative sleep.",
    accessLevel: "Member"
  },
  {
    id: 3,
    title: "Reframing Thoughts",
    type: "Video",
    category: "Therapy",
    duration: "20 min",
    description: "A visual guide to understanding and shifting negative thought patterns.",
    accessLevel: "Open"
  },
  {
    id: 4,
    title: "Daily Focus Journal",
    type: "Tool",
    category: "Productivity",
    duration: "Interactive",
    description: "A simple template to help you organize your day without overwhelm.",
    accessLevel: "Open"
  },
  {
    id: 5,
    title: "Healing After Trauma",
    type: "Guide",
    category: "Trauma",
    duration: "30 min read",
    description: "Compassionate approaches to processing difficult experiences safely.",
    accessLevel: "Member"
  },
  {
    id: 6,
    title: "Mindfulness Basics",
    type: "Audio",
    category: "Mindfulness",
    duration: "10 min",
    description: "A short, guided meditation to help you arrive in the present moment.",
    accessLevel: "Open"
  }
];

const categories = ["All", "Anxiety", "Sleep", "Therapy", "Productivity", "Mindfulness"];

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = resources.filter(r => {
    const matchesCategory = activeCategory === "All" || r.category === activeCategory;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <GridBackground />

      {/* HEADER */}
      <div className="pt-24 pb-12 border-b border-border bg-background/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest mb-2">
                <BookOpen className="w-3 h-3" />
                Library
              </div>
              <h1 className="font-heading text-6xl md:text-7xl font-bold uppercase leading-[0.85] mb-4">
                Wellness <br />
                <span className="text-primary">Resources</span>
              </h1>
              <p className="text-muted-foreground max-w-xl border-l-2 border-primary pl-4">
                Curated tools and guides for your mental health journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">

          {/* SEARCH */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find resources..."
              className="w-full bg-black border border-border h-12 pl-12 pr-4 text-sm font-mono focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50 rounded-md"
            />
          </div>

          {/* CATEGORIES */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 border border-border text-xs uppercase font-bold transition-all hover:bg-primary hover:text-black hover:border-primary rounded-sm ${activeCategory === cat ? 'bg-primary text-black border-primary' : 'bg-black text-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource) => (
            <IsoCard key={resource.id} className="cursor-pointer group">
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block px-2 py-1 bg-white/5 border border-white/10 text-[10px] uppercase text-muted-foreground rounded-sm">
                    {resource.type}
                  </span>
                  {resource.accessLevel === "Member" && (
                    <Lock className="w-4 h-4 text-primary" />
                  )}
                </div>

                <h3 className="font-heading text-2xl uppercase mb-3 leading-none group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>

                <p className="text-sm text-muted-foreground font-sans mb-6 flex-1">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {resource.duration}
                  </span>
                  <button className="text-primary hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase">
                    View <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </IsoCard>
          ))}
        </div>
      </div>
    </div>
  );
}
