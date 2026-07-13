"use client";

import { logostore } from "@/config/logo-story.config";
import { cn } from "@/lib/utils";
import {
  IconActivity,
  IconArrowRight,
  IconAtom,
  IconFingerprint,
  IconInfinity,
  IconLayersIntersect,
  IconRefresh,
  IconRoute,
  IconScale,
  IconTrendingUp,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// Ecosystem Elements types
type ElementType = "roles" | "trust" | "portfolio";

// Design Principles types
type PrincipleType = "minimalism" | "storytelling" | "balance" | "continuity" | "human_centered";

interface RoleDetail {
  name: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  meaning: string;
}

const ROLES_DETAILS: Record<string, RoleDetail> = {
  Learner: {
    name: "Learner",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/15",
    meaning: "Acquires skills, explores new fields, and learns from verified campus mentors.",
  },
  Buyer: {
    name: "Buyer",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/15",
    meaning: "Posts tasks, hires peers, and delegates work to talented campus freelancers.",
  },
  Seller: {
    name: "Seller",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    glow: "shadow-red-500/15",
    meaning: "Monetizes their expertise, works on local gigs, and builds a stellar portfolio.",
  },
  Collaborator: {
    name: "Collaborator",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/15",
    meaning: "Partners up for team-based projects and multidisciplinary collaborations.",
  },
  Mentor: {
    name: "Mentor",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    glow: "shadow-purple-500/15",
    meaning: "Guides junior students, shares knowledge, and leads projects to success.",
  },
};

export function EcosystemPrinciples() {
  // Ecosystem Elements selection state
  const [activeElement, setActiveElement] = useState<ElementType>("roles");
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("Learner");

  // Design Principles selection state
  const [activePrinciple, setActivePrinciple] = useState<PrincipleType>("minimalism");

  const activeRoleDetail = ROLES_DETAILS[hoveredRole || selectedRole] || ROLES_DETAILS.Learner;

  return (
    <div className="mx-auto mt-32 max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary mb-3">
          <IconAtom className="size-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Ecosystem Rules &amp; Intentions</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground bg-linear-to-b from-foreground to-foreground/80 bg-clip-text">
          Philosophy &amp; Design Core
        </h2>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
          Explore the underlying dynamics of our campus marketplace and the minimalist rules guiding our brand.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 items-stretch">
        
        {/* LEFT COLUMN: Ecosystem Elements (Hidden Symbolism) */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-border/80 bg-card/25 backdrop-blur-md p-6 sm:p-8 relative overflow-hidden shadow-xl">
          {/* Subtle decoration lines */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[32px_32px] opacity-10 pointer-events-none" />
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <IconFingerprint className="size-5 text-emerald-500" />
                <span className="font-mono text-xs uppercase tracking-widest text-emerald-500 font-bold">Ecosystem Logic</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                Ecosystem Elements
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                The visual elements of the loop represent a self-sustaining cycle where students build reputation and trust.
              </p>
            </div>

            {/* Interactive Selectors */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveElement("roles")}
                className={cn(
                  "flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-300 font-semibold text-xs",
                  activeElement === "roles"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-xs"
                    : "bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                )}
              >
                <IconUsers className="size-4 shrink-0" />
                <span className="truncate">Dynamic Roles</span>
              </button>

              <button
                onClick={() => setActiveElement("trust")}
                className={cn(
                  "flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-300 font-semibold text-xs",
                  activeElement === "trust"
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-xs"
                    : "bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                )}
              >
                <IconRefresh className="size-4 shrink-0" />
                <span className="truncate">Closed Loop</span>
              </button>

              <button
                onClick={() => setActiveElement("portfolio")}
                className={cn(
                  "flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-300 font-semibold text-xs",
                  activeElement === "portfolio"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-xs"
                    : "bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                )}
              >
                <IconTrendingUp className="size-4 shrink-0" />
                <span className="truncate">Portfolio Accrual</span>
              </button>
            </div>

            {/* Showcase Display Area */}
            <div className="min-h-70 flex flex-col justify-between border border-border/40 rounded-2xl bg-background/30 p-5 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {activeElement === "roles" && (
                  <motion.div
                    key="roles"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="h-full flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-foreground">Dynamic Multi-role Cycle</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {logostore.hidden_symbolism.student_roles.meaning}
                      </p>
                    </div>

                    {/* Interactive Role Cloud */}
                    <div className="flex flex-wrap gap-2">
                      {logostore.hidden_symbolism.student_roles.roles.map((role) => {
                        const isSelected = selectedRole === role;
                        const roleMeta = ROLES_DETAILS[role] || ROLES_DETAILS.Learner;
                        return (
                          <button
                            key={role}
                            onMouseEnter={() => setHoveredRole(role)}
                            onMouseLeave={() => setHoveredRole(null)}
                            onClick={() => setSelectedRole(role)}
                            className={cn(
                              "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-300 shrink-0",
                              isSelected
                                ? cn(roleMeta.bg, roleMeta.border, roleMeta.color, "scale-105")
                                : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                          >
                            {role}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Role Card Explanation */}
                    <div className={cn(
                      "p-3.5 rounded-xl border transition-all duration-300 bg-muted/10",
                      activeRoleDetail.border
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-xs font-bold uppercase tracking-wider", activeRoleDetail.color)}>
                          {activeRoleDetail.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {activeRoleDetail.meaning}
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeElement === "trust" && (
                  <motion.div
                    key="trust"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="h-full flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <h4 className="text-sm font-bold text-foreground">Closed Loop Trust</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {logostore.hidden_symbolism.closed_ecosystem.meaning}
                      </p>
                      <div className="inline-flex items-center gap-1 text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-mono mt-1">
                        <IconActivity className="size-3 animate-pulse" />
                        <span>Secure Campus Network</span>
                      </div>
                    </div>

                    {/* Circular Ecosystem SVG Simulation */}
                    <div className="size-36 flex items-center justify-center shrink-0 border border-border/40 rounded-full bg-background/40 relative">
                      <svg className="absolute size-full p-2" viewBox="0 0 100 100">
                        {/* Center campus label */}
                        <circle cx="50" cy="50" r="10" fill="none" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 2" />
                        <text x="50" y="52" textAnchor="middle" fontSize="6" fontWeight="bold" className="fill-muted-foreground/60 font-mono">JnU</text>

                        {/* Looping path */}
                        <circle cx="50" cy="50" r="32" fill="none" stroke="var(--color-border)" strokeWidth="0.75" />
                        <motion.circle 
                          cx="50" 
                          cy="50" 
                          r="32" 
                          fill="none" 
                          stroke="url(#loopGlow)" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                          strokeDasharray="40 160"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, ease: "linear", duration: 8 }}
                          style={{ transformOrigin: "50px 50px" }}
                        />
                        <defs>
                          <linearGradient id="loopGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-emerald-500)" />
                            <stop offset="50%" stopColor="var(--color-blue-500)" />
                            <stop offset="100%" stopColor="var(--color-emerald-500)" />
                          </linearGradient>
                        </defs>
                        {/* Corner nodes */}
                        <circle cx="50" cy="18" r="3" className="fill-emerald-500" />
                        <circle cx="82" cy="50" r="3" className="fill-red-500" />
                        <circle cx="50" cy="82" r="3" className="fill-amber-500" />
                        <circle cx="18" cy="50" r="3" className="fill-blue-500" />
                      </svg>
                    </div>
                  </motion.div>
                )}

                {activeElement === "portfolio" && (
                  <motion.div
                    key="portfolio"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="h-full flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <h4 className="text-sm font-bold text-foreground">Continuous Portfolio Accrual</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {logostore.hidden_symbolism.portfolio_growth.meaning}
                      </p>
                      <div className="inline-flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-mono mt-1">
                        <span>XP &amp; Reputation Accumulator</span>
                      </div>
                    </div>

                    {/* Animated Portfolio Graph SVG */}
                    <div className="size-36 flex items-center justify-center shrink-0 border border-border/40 rounded-xl bg-background/40 p-2">
                      <svg className="size-full" viewBox="0 0 100 100">
                        {/* Grid lines */}
                        <line x1="10" y1="90" x2="90" y2="90" stroke="var(--color-border)" strokeWidth="0.5" />
                        <line x1="10" y1="10" x2="10" y2="90" stroke="var(--color-border)" strokeWidth="0.5" />
                        
                        {/* Dynamic Path */}
                        <motion.path 
                          d="M 10 80 Q 30 75 50 45 T 90 15" 
                          fill="none" 
                          stroke="url(#accrualGlow)" 
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                        />
                        
                        <defs>
                          <linearGradient id="accrualGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--color-blue-500)" />
                            <stop offset="100%" stopColor="var(--color-amber-500)" />
                          </linearGradient>
                        </defs>
                        
                        {/* Pulsing indicator node */}
                        <motion.circle 
                          cx="90" cy="15" r="4" 
                          fill="var(--color-amber-500)" 
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }} 
                          transition={{ duration: 1.5, repeat: Infinity }} 
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Design Intentions (Design Principles) */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-border/80 bg-card/25 backdrop-blur-md p-6 sm:p-8 relative overflow-hidden shadow-xl">
          {/* Subtle grid background */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[32px_32px] opacity-10 pointer-events-none" />
          
          <div className="space-y-6 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <IconLayersIntersect className="size-5 text-blue-500" />
                <span className="font-mono text-xs uppercase tracking-widest text-blue-500 font-bold">Design DNA</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                Design Intentions
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Our design principles enforce visual clarity, balance, and student-focused identity across the brand.
              </p>
            </div>

            {/* Split layout: left list of principles, right visual blueprint preview */}
            <div className="grid gap-6 sm:grid-cols-12 items-center grow mt-4">
              
              {/* Selector buttons list */}
              <div className="sm:col-span-6 flex flex-col gap-2">
                {(Object.keys(logostore.design_principles) as PrincipleType[]).map((principle) => {
                  const isActive = activePrinciple === principle;
                  
                  const getPrincipleIcon = (p: PrincipleType) => {
                    switch (p) {
                      case "minimalism": return <IconLayersIntersect className="size-4 shrink-0" />;
                      case "storytelling": return <IconRoute className="size-4 shrink-0" />;
                      case "balance": return <IconScale className="size-4 shrink-0" />;
                      case "continuity": return <IconInfinity className="size-4 shrink-0" />;
                      case "human_centered": return <IconUser className="size-4 shrink-0" />;
                    }
                  };

                  return (
                    <button
                      key={principle}
                      onClick={() => setActivePrinciple(principle)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all duration-300 font-semibold text-xs outline-hidden",
                        isActive
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-xs"
                          : "bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {getPrincipleIcon(principle)}
                        <span className="capitalize">{principle.replace("_", " ")}</span>
                      </div>
                      <IconArrowRight className={cn("size-3.5 transition-all duration-300 shrink-0", isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")} />
                    </button>
                  );
                })}
              </div>

              {/* Showcase Blueprint Visualizer box */}
              <div className="sm:col-span-6 border border-border/40 bg-background/30 rounded-2xl p-4 flex flex-col items-center justify-center min-h-55 relative overflow-hidden">
                {/* Blueprint grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[16px_16px] opacity-15 pointer-events-none" />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePrinciple}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center justify-between size-full gap-4 text-center z-10"
                  >
                    {/* Render corresponding interactive SVG diagram */}
                    <div className="size-28 flex items-center justify-center relative">
                      {activePrinciple === "minimalism" && (
                        <svg className="size-full text-blue-500" viewBox="0 0 100 100">
                          <rect x="15" y="15" width="70" height="70" fill="none" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 2" />
                          <line x1="50" y1="15" x2="50" y2="85" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 2" />
                          <line x1="15" y1="50" x2="85" y2="50" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 2" />
                          
                          {/* Outer geometric box collapsing */}
                          <motion.polygon 
                            points="25,25 75,25 75,75 25,75" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.2"
                            animate={{ 
                              points: ["25,25 75,25 75,75 25,75", "42,42 58,42 58,58 42,58", "25,25 75,25 75,75 25,75"],
                              rotate: [0, 90, 180, 270, 360]
                            }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            style={{ transformOrigin: "50px 50px" }}
                          />
                          {/* Inner clean essential node */}
                          <motion.circle 
                            cx="50" 
                            cy="50" 
                            r="5" 
                            fill="currentColor" 
                            animate={{ scale: [1, 1.3, 1] }} 
                            transition={{ duration: 2, repeat: Infinity }} 
                          />
                        </svg>
                      )}

                      {activePrinciple === "storytelling" && (
                        <svg className="size-full text-blue-500" viewBox="0 0 100 100">
                          {/* Quadrant anchor dots */}
                          <circle cx="30" cy="30" r="3.5" fill="currentColor" className="opacity-40" />
                          <circle cx="70" cy="30" r="3.5" fill="currentColor" className="opacity-40" />
                          <circle cx="70" cy="70" r="3.5" fill="currentColor" className="opacity-40" />
                          <circle cx="30" cy="70" r="3.5" fill="currentColor" className="opacity-40" />
                          
                          {/* Looping story path */}
                          <motion.path 
                            d="M 30 30 Q 50 15 70 30 Q 85 50 70 70 Q 50 85 30 70 Q 15 50 30 30" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeDasharray="4 4"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                          />
                          
                          {/* Story walker dot */}
                          <motion.circle 
                            cx="30" 
                            cy="30" 
                            r="3" 
                            fill="currentColor"
                            animate={{
                              cx: [30, 70, 70, 30, 30],
                              cy: [30, 30, 70, 70, 30],
                            }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </svg>
                      )}

                      {activePrinciple === "balance" && (
                        <svg className="size-full text-blue-500" viewBox="0 0 100 100">
                          {/* Ground and support */}
                          <line x1="20" y1="80" x2="80" y2="80" stroke="var(--color-border)" strokeWidth="0.75" />
                          <polygon points="50,80 45,68 55,68" className="fill-muted-foreground/30" />
                          
                          {/* Seesaw scale arm */}
                          <motion.g
                            animate={{ rotate: [-6, 6, -6] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            style={{ transformOrigin: "50px 68px" }}
                          >
                            <line x1="20" y1="68" x2="80" y2="68" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            {/* Left scale weight */}
                            <circle cx="20" cy="74" r="5" className="fill-blue-500" />
                            {/* Right scale weight */}
                            <circle cx="80" cy="74" r="5" className="fill-red-500" />
                          </motion.g>
                          
                          {/* Symmetrical center node */}
                          <circle cx="50" cy="68" r="3.5" className="fill-emerald-500" />
                        </svg>
                      )}

                      {activePrinciple === "continuity" && (
                        <svg className="size-full text-blue-500" viewBox="0 0 100 100">
                          {/* Continuous infinity pattern */}
                          <motion.path 
                            d="M 50 50 C 35 25, 20 25, 20 50 C 20 75, 35 75, 50 50 C 65 25, 80 25, 80 50 C 80 75, 65 75, 50 50" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <circle cx="50" cy="50" r="3" className="fill-emerald-500" />
                        </svg>
                      )}

                      {activePrinciple === "human_centered" && (
                        <svg className="size-full text-blue-500" viewBox="0 0 100 100">
                          {/* Concentric pulsing rings */}
                          <motion.circle 
                            cx="50" cy="50" r="22" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="0.75" 
                            animate={{ scale: [1, 1.6], opacity: [1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                          />
                          <motion.circle 
                            cx="50" cy="50" r="32" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="0.75" 
                            animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
                            transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: "easeOut" }}
                          />
                          
                          {/* Outer stakeholder satellite nodes */}
                          <circle cx="20" cy="50" r="2.5" className="fill-muted-foreground/40" />
                          <circle cx="80" cy="50" r="2.5" className="fill-muted-foreground/40" />
                          <circle cx="50" cy="20" r="2.5" className="fill-muted-foreground/40" />
                          <circle cx="50" cy="80" r="2.5" className="fill-muted-foreground/40" />
                          
                          {/* Centered user core */}
                          <circle cx="50" cy="50" r="9" className="fill-blue-500/10" />
                          <circle cx="50" cy="50" r="4.5" className="fill-blue-500" />
                        </svg>
                      )}
                    </div>

                    <div className="space-y-1 mt-2">
                      <span className="text-xs font-bold capitalize text-foreground">
                        {activePrinciple.replace("_", " ")}
                      </span>
                      <p className="text-[10px] text-muted-foreground leading-relaxed max-w-45 mx-auto">
                        {logostore.design_principles[activePrinciple]}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
