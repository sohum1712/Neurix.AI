import React from 'react';
import { Phone, Heart } from 'lucide-react';

export default function EmergencyWidget() {
  return (
    <div className="fixed bottom-12 right-6 z-[9999]">
      <a
        href="https://telemanas.mohfw.gov.in/home"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-card/80 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-red-500/20 hover:border-red-500/50"
        aria-label="Emergency mental health helpline"
      >
        {/* Icon container with pulse effect */}
        <div className="relative">
          <Phone className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
          <Heart className="w-3 h-3 text-red-400 absolute -top-1 -right-1 animate-pulse" />
        </div>

        {/* Tooltip on hover */}
        <div className="absolute right-full mr-3 px-3 py-2 bg-card/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-foreground">24/7 HELPLINE</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Click for support</p>
        </div>

        {/* Subtle outer ring animation */}
        <span className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-20" />
      </a>
    </div>
  );
}
