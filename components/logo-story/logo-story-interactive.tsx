"use client";

import { AnatomyBreakdown } from "@/components/logo-story/anatomy-breakdown";
import { CtaSection } from "@/components/logo-story/cta-section";
import { DesignDetailsGrid } from "@/components/logo-story/design-details-grid";
import { EcosystemPlayground } from "@/components/logo-story/ecosystem-playground";
import { EcosystemPrinciples } from "@/components/logo-story/ecosystem-principles";
import { HeroSection } from "@/components/logo-story/hero-section";
import { PhilosophyCallout } from "@/components/logo-story/philosophy-callout";
import { PhilosophyStatement } from "@/components/logo-story/philosophy-statement";
import { StoryPanel } from "@/components/logo-story/story-panel";
import { NodeType } from "@/components/logo-story/types-and-helpers";
import { logostore } from "@/config/logo-story.config";
import { useEffect, useState } from "react";

export function LogoStoryInteractive() {
  const [hoveredNode, setHoveredNode] = useState<NodeType | "spiral" | null>(
    null,
  );
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Auto-play the flow story steps
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % logostore.flow_story.steps.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative min-h-screen overflow-hidden py-12 text-foreground">
      {/* Immersive mesh gradients — all merge into a single focal glow at center */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[140px]" />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[130px]" />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-[120px]" />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Interactive Anatomy Section */}
      <div className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Interactive Playground (Canvas) */}
          <EcosystemPlayground
            hoveredNode={hoveredNode}
            setHoveredNode={setHoveredNode}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            setIsPlaying={setIsPlaying}
          />

          {/* Story Telling Side Panel (Content Info Card) */}
          <StoryPanel
            hoveredNode={hoveredNode}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        </div>
      </div>

      {/* Philosophy Callout (Premium Gradient Panel) */}
      <PhilosophyCallout />

      {/* Visual Corner Deep Dives */}
      <AnatomyBreakdown />

      {/* Structure, Colors & Decisions Grid */}
      <DesignDetailsGrid />

      {/* Hidden Symbolism & Design Principles */}
      <EcosystemPrinciples />

      {/* Hidden Message / Statement Callout */}
      <PhilosophyStatement />

      {/* CTA Section */}
      <CtaSection />
    </div>
  );
}
