"use client";

import { logostore } from "@/config/logo-story.config";
import {
  IconCircleCheck,
  IconCircleDot,
  IconEye,
  IconLayersIntersect,
  IconPalette,
} from "@tabler/icons-react";
import { motion } from "motion/react";

export function DesignDetailsGrid() {
  return (
    <div className="mx-auto mt-32 max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary mb-3">
          <IconPalette className="size-3.5" />
          <span>Visual Identity Specifications</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground bg-linear-to-b from-foreground to-foreground/80 bg-clip-text">
          Logo Structure &amp; Color DNA
        </h2>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
          The mathematical geometry, color systems, and strategic brand
          decisions behind the GigHub visual mark.
        </p>
      </div>

      {/* BLOCK 1: Circular Ecosystem (The Geometry) */}
      <div className="grid gap-12 lg:grid-cols-12 items-center border-t border-border/60 pt-12">
        {/* Left Side: Animated SVG CAD Diagram */}
        <div className="lg:col-span-5 flex justify-center items-center relative py-6">
          <div className="absolute inset-0 bg-radial from-emerald-500/5 via-transparent to-transparent blur-2xl pointer-events-none" />

          <div className="relative size-64 flex items-center justify-center border border-border/40 rounded-full bg-background/20 backdrop-blur-xs">
            {/* Crosshair grid lines */}
            <div className="absolute inset-x-0 h-px bg-border/30" />
            <div className="absolute inset-y-0 w-px bg-border/30" />

            {/* Rotating Outer Ring */}
            <svg
              className="absolute size-56 animate-spin"
              style={{ animationDuration: "24s" }}
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-muted-foreground/20"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="var(--color-emerald-500)"
                strokeWidth="1.5"
                strokeDasharray="15 35"
                className="opacity-80"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="var(--color-blue-500)"
                strokeWidth="1.5"
                strokeDasharray="30 120"
                className="opacity-80"
              />
            </svg>

            {/* Inner Spiral Mockup */}
            <svg className="absolute size-32 opacity-75" viewBox="0 0 100 100">
              <path
                d="M 50 50 A 10 10 0 0 1 60 50 A 20 20 0 0 1 40 50 A 30 30 0 0 1 70 50 A 40 40 0 0 1 30 50"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="animate-pulse"
              />
            </svg>

            {/* Visual Node Anchors */}
            <div className="absolute top-1 size-3 rounded-full bg-emerald-500 shadow-[0_0_8px_var(--color-emerald-500)]" />
            <div className="absolute right-1 size-3 rounded-full bg-red-500 shadow-[0_0_8px_var(--color-red-500)]" />
            <div className="absolute bottom-1 size-3 rounded-full bg-amber-500 shadow-[0_0_8px_var(--color-amber-500)]" />
            <div className="absolute left-1 size-3 rounded-full bg-blue-500 shadow-[0_0_8px_var(--color-blue-500)]" />

            <div className="absolute text-[8px] font-mono text-muted-foreground/60 top-2 right-2">
              SYS_R: 46px
            </div>
            <div className="absolute text-[8px] font-mono text-muted-foreground/60 bottom-2 left-2">
              ROT: 15deg/s
            </div>
          </div>
        </div>

        {/* Right Side: Typography & Detail List */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <IconLayersIntersect className="size-5 text-emerald-500" />
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-500 font-bold">
                Geometry Spec
              </span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {logostore.structure.overall_shape.type}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              {logostore.structure.outer_connections.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {logostore.structure.overall_shape.meaning.map((pt, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/20 transition-all duration-300"
              >
                <IconCircleDot className="mt-0.5 size-4 text-emerald-500 shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {pt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BLOCK 2: Brand Color Architecture */}
      <div className="border-t border-border/60 pt-12 space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <IconPalette className="size-5 text-blue-500" />
            <span className="font-mono text-xs uppercase tracking-widest text-blue-500 font-bold">
              Color Palette Matrix
            </span>
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            Brand Color Architecture
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            A precise alignment of hue and value representing the core tenets of
            the student marketplace.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Green System */}
          <div className="space-y-4">
            {/* Color Swatch Card */}
            <div className="relative group rounded-2xl border border-border/80 bg-background overflow-hidden p-4">
              <div className="h-28 rounded-lg bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col justify-end p-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-radial from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-mono text-[10px] text-white/70 font-semibold tracking-wider">
                  PRIMARY_G1
                </span>
                <span className="font-mono text-xs text-white font-bold tracking-widest">
                  #10B981
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                <span>RGB: 16, 185, 129</span>
                <span>HSL: 160°, 84%, 39%</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Green
                System
              </h4>

              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {logostore.color_system.green.meaning.map((m, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <IconCircleCheck className="size-3.5 text-emerald-500/80 shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-border/40">
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block mb-1">
                  Used In:
                </span>
                <div className="flex flex-wrap gap-1">
                  {logostore.color_system.green.used_for.map((u, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-medium bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Blue System */}
          <div className="space-y-4">
            {/* Color Swatch Card */}
            <div className="relative group rounded-2xl border border-border/80 bg-background overflow-hidden p-4">
              <div className="h-28 rounded-lg bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col justify-end p-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-radial from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-mono text-[10px] text-white/70 font-semibold tracking-wider">
                  PRIMARY_B1
                </span>
                <span className="font-mono text-xs text-white font-bold tracking-widest">
                  #3B82F6
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                <span>RGB: 59, 130, 246</span>
                <span>HSL: 221°, 92%, 58%</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-blue-500" /> Blue
                System
              </h4>

              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {logostore.color_system.blue.meaning.map((m, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <IconCircleCheck className="size-3.5 text-blue-500/80 shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-border/40">
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block mb-1">
                  Used In:
                </span>
                <div className="flex flex-wrap gap-1">
                  {logostore.color_system.blue.used_for.map((u, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-medium bg-blue-500/5 border border-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Red System */}
          <div className="space-y-4">
            {/* Color Swatch Card */}
            <div className="relative group rounded-2xl border border-border/80 bg-background overflow-hidden p-4">
              <div className="h-28 rounded-lg bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.15)] flex flex-col justify-end p-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-radial from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-mono text-[10px] text-white/70 font-semibold tracking-wider">
                  PRIMARY_R1
                </span>
                <span className="font-mono text-xs text-white font-bold tracking-widest">
                  #EF4444
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                <span>RGB: 239, 68, 68</span>
                <span>HSL: 0°, 84%, 60%</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-red-500" /> Red System
              </h4>

              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {logostore.color_system.red.meaning.map((m, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <IconCircleCheck className="size-3.5 text-red-500/80 shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-border/40">
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block mb-1">
                  Used In:
                </span>
                <div className="flex flex-wrap gap-1">
                  {logostore.color_system.red.used_for.map((u, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-medium bg-red-500/5 border border-red-500/10 text-red-500 px-1.5 py-0.5 rounded"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCK 3: Commerce vs. Growth (Editorial Center Paradox) */}
      <div className="border-t border-border/60 pt-12 space-y-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Philosophical Quote Editorial */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <IconEye className="size-5 text-primary" />
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                Design Directive
              </span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Commerce vs. Growth
            </h3>
            <div className="relative border-l-2 border-primary/40 pl-4 py-1 mt-4">
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                &ldquo;{logostore.center_color_decision.observation}&rdquo;
              </p>
            </div>
          </div>

          {/* Right Column: Numbered Spec List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="divide-y divide-border/60">
              {logostore.center_color_decision.reason.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <span className="font-mono text-xs font-bold text-primary/60 bg-muted/60 px-2 py-0.5 rounded border border-border">
                    {`0${idx + 1}`}
                  </span>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Immersive Brand Statement Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl border border-primary/20 bg-linear-to-r from-emerald-500/5 via-blue-500/5 to-red-500/5 p-6 text-center overflow-hidden shadow-xs"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-primary)/0.02,transparent_60%)] pointer-events-none" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/80 block mb-1">
            Philosophical Core
          </span>
          <p className="text-sm sm:text-base font-extrabold text-foreground tracking-wide">
            {logostore.center_color_decision.brand_statement}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
