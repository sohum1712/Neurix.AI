import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

// --- HUD Container (Box with corner markers) ---
export const HUDContainer = ({
    children,
    className,
    title,
    timestamp
}: {
    children: React.ReactNode;
    className?: string;
    title?: string;
    timestamp?: boolean;
}) => {
    return (
        <div className={cn("relative group border border-border bg-card/50 backdrop-blur-sm p-6 overflow-hidden transition-colors hover:border-primary/50", className)}>
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-primary" />
            <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-primary" />

            {/* Header */}
            {(title || timestamp) && (
                <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
                    {title && (
                        <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                    )}
                    {timestamp && (
                        <span className="font-mono text-[10px] text-muted-foreground/50">
                            {new Date().toLocaleTimeString()}
                        </span>
                    )}
                </div>
            )}

            {children}
        </div>
    );
};

// --- IsoCard (Pseudo-3D layered card) ---
export const IsoCard = ({
    children,
    className,
    delay = 0
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, x: -5 }}
            className={cn("relative w-full h-full", className)}
        >
            {/* Shadow layer */}
            <div className="absolute inset-0 bg-primary/20 translate-x-2 translate-y-2 border border-primary/20 z-0 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />

            {/* Content layer */}
            <div className="relative z-10 bg-card border border-border h-full p-6 transition-transform duration-300 hover:border-primary">
                {children}
            </div>
        </motion.div>
    );
};

// --- StatsDisplay (Big Numbers) ---
export const StatsDisplay = ({
    label,
    value,
    trend,
    direction = "up" // "up" | "down" | "neutral"
}: {
    label: string;
    value: string | number;
    trend?: string;
    direction?: "up" | "down" | "neutral";
}) => {
    const trendColor =
        direction === "up" ? "text-primary" :
            direction === "down" ? "text-red-500" :
                "text-muted-foreground";

    return (
        <div className="flex flex-col">
            <span className="font-mono text-xs uppercase text-muted-foreground mb-1">{label}</span>
            <div className="flex items-baseline gap-2">
                <span className="font-heading text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                    {value}
                </span>
                {trend && (
                    <span className={cn("font-mono text-xs flex items-center", trendColor)}>
                        {direction === "up" ? "▲" : direction === "down" ? "▼" : "●"} {trend}
                    </span>
                )}
            </div>
        </div>
    );
};

// --- GlitchText (Hover effect for headings) ---
export const GlitchText = ({ text, className }: { text: string, className?: string }) => {
    return (
        <div className={cn("relative group inline-block", className)}>
            <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-100">{text}</span>
            <span className="absolute inset-0 text-primary opacity-0 group-hover:opacity-100 translate-x-[2px] skew-x-12 transition-all duration-100 select-none" aria-hidden="true">
                {text}
            </span>
            <span className="absolute inset-0 text-red-500 opacity-0 group-hover:opacity-50 -translate-x-[2px] -skew-x-12 transition-all duration-100 delay-75 select-none mix-blend-screen" aria-hidden="true">
                {text}
            </span>
        </div>
    );
};

// --- TickerTape (Scrolling marquee) ---
export const TickerTape = ({ items }: { items: string[] }) => {
    return (
        <div className="w-full bg-primary text-primary-foreground overflow-hidden py-1 border-y border-primary-foreground/20 font-mono text-xs uppercase font-bold tracking-widest select-none">
            <div className="animate-marquee whitespace-nowrap flex gap-8 pointer-events-none">
                {[...items, ...items, ...items].map((item, i) => (
                    <span key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary-foreground animate-pulse" />
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
};

// --- GridBackground (Cyberpunk/Technical grid) ---
export const GridBackground = () => (
    <div className="absolute inset-0 grid-bg opacity-[0.3] pointer-events-none z-0" />
); // Increased opacity for the blue theme


export const Button3D = ({
    children,
    onClick,
    className,
    variant = "primary",
    type,
    disabled
}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: "primary" | "outline" | "danger";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
}) => {
    const variants = {
        primary: "bg-primary text-primary-foreground border-primary hover:translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none",
        outline: "bg-transparent text-primary border-primary hover:bg-white/10 hover:translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none",
        danger: "bg-red-600 text-white border-red-600 hover:translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
    };

    return (
        <button
            onClick={onClick}
            type={type}
            disabled={disabled}
            className={cn(
                "relative group border-2 px-6 py-3 font-mono font-bold uppercase tracking-wider transition-all duration-200 rounded-md", // Added rounded-md for Sera style
                variants[variant],
                className
            )}
        >
            {/* Shadow Block */}
            <div className={cn(
                "absolute top-0 left-0 w-full h-full -z-10 bg-background box-border border-2 transition-transform duration-200 translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 group-active:translate-x-1 group-active:translate-y-1 rounded-md",
                variant === 'outline' ? 'border-primary' : 'border-background mix-blend-multiply opacity-50'
            )} />

            <span className="flex items-center gap-2">
                {children}
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:rotate-45" />
            </span>
        </button>
    );
};
