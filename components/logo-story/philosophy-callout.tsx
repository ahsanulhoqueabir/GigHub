"use client";

import { logostore } from "@/config/logo-story.config";
import { motion } from "motion/react";
import Image from "next/image";

export function PhilosophyCallout() {
  return (
    <div className="mx-auto mt-24 max-w-5xl px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl border border-primary/20 overflow-hidden bg-linear-to-r from-primary/10 via-takeway/10 to-transparent p-8 md:p-12 text-center"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Image src="/brand/logo.svg" alt="logo" width={200} height={200} />
        </div>
        <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2 block">
          Core Philosophy
        </span>
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground bg-linear-to-r from-foreground to-muted-foreground bg-clip-text">
          &ldquo;{logostore.center_color_decision.brand_statement}&rdquo;
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-muted-foreground">
          {logostore.brand.core_philosophy}
        </p>
      </motion.div>
    </div>
  );
}
