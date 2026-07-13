"use client";

import { logostore } from "@/config/logo-story.config";
import { motion } from "motion/react";

export function HeroSection() {
  return (
    <div className="mx-auto max-w-5xl px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-linear-to-r from-primary via-primary/60 to-secondary bg-clip-text text-transparent">
          {logostore.logo_story.title}
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground text-balance">
          {logostore.logo_story.summary}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-muted-foreground">
          <span className="flex items-center gap-2 rounded-lg bg-card/30 px-3 py-1.5 border border-border/40">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Green: Learning
          </span>
          <span className="flex items-center gap-2 rounded-lg bg-card/30 px-3 py-1.5 border border-border/40">
            <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
            Blue: Trust & Technology
          </span>
          <span className="flex items-center gap-2 rounded-lg bg-card/30 px-3 py-1.5 border border-border/40">
            <span className="size-2 rounded-full bg-red-500 animate-pulse" />
            Red: Opportunity & Action
          </span>
        </div>
      </motion.div>
    </div>
  );
}
