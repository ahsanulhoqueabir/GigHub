"use client";

import { logostore } from "@/config/logo-story.config";
import { cn } from "@/lib/utils";
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowRight as IconArrowRightDir,
  IconPlayerPause,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { getNodeDetails, NodeType } from "./types-and-helpers";

interface StoryPanelProps {
  hoveredNode: NodeType | "spiral" | null;
  activeStep: number;
  setActiveStep: (step: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

export function StoryPanel({
  hoveredNode,
  activeStep,
  setActiveStep,
  isPlaying,
  setIsPlaying,
}: StoryPanelProps) {
  const stepsCount = logostore.flow_story.steps.length;

  const handleNextStep = () => {
    setIsPlaying(false);
    setActiveStep((prev) => (prev + 1) % stepsCount);
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    setActiveStep((prev) => (prev - 1 + stepsCount) % stepsCount);
  };

  const handleStepClick = (idx: number) => {
    setIsPlaying(false);
    setActiveStep(idx);
  };

  return (
    <div className="lg:col-span-6 space-y-6">
      <div className="rounded-3xl border border-border/40 bg-card/35 p-6 md:p-8 backdrop-blur-md shadow-lg min-h-95 flex flex-col justify-between">
        {/* Conditional Rendering based on active hover or active timeline step */}
        <AnimatePresence mode="wait">
          {hoveredNode === "spiral" ? (
            <motion.div
              key="spiral-info"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Image
                    src="/logo-story/Spiral.svg"
                    alt="Spiral Icon"
                    width={28}
                    height={28}
                    className="size-7"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-primary tracking-wide uppercase">
                    Core Heart
                  </span>
                  <h2 className="text-2xl font-bold text-foreground">
                    {logostore.structure.center_spiral.description}
                  </h2>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {logostore.structure.center_spiral.reason}
              </p>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Meaning & Philosophy:
                </h4>
                <ul className="grid gap-2 text-sm text-muted-foreground">
                  {logostore.structure.center_spiral.meaning.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : hoveredNode ? (
            // Node Hover State
            (() => {
              const details = getNodeDetails(hoveredNode);
              if (!details) return null;
              return (
                <motion.div
                  key={`${hoveredNode}-info`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-xl border",
                        details.bg,
                        details.border,
                      )}
                    >
                      <Image
                        src={details.svg}
                        alt={details.data.role}
                        width={28}
                        height={28}
                        className="size-7 object-contain"
                      />
                    </div>
                    <div>
                      <span
                        className={cn(
                          "text-xs font-bold tracking-wide uppercase",
                          details.color,
                        )}
                      >
                        Node: {details.data.role}
                      </span>
                      <h2 className="text-2xl font-bold text-foreground">
                        {hoveredNode.charAt(0).toUpperCase() +
                          hoveredNode.slice(1)}
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground italic">
                    Position: {details.data.position}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      Role in the Loop:
                    </h4>
                    <ul className="grid gap-2 text-sm text-muted-foreground">
                      {details.data.meaning.map((m, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span
                            className={cn(
                              "mt-1.5 size-1.5 rounded-full shrink-0",
                              details.color.replace("text", "bg"),
                            )}
                          />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-4 border border-border/20">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                      Visual Logic
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {details.data.reason_for_position}
                    </p>
                  </div>
                </motion.div>
              );
            })()
          ) : (
            // Flow Story activeStep State (Default)
            (() => {
              const stepData = logostore.flow_story.steps[activeStep];
              const fromDetails = getNodeDetails(
                stepData.from.toLowerCase() as NodeType,
              );
              const toDetails = getNodeDetails(
                stepData.to.toLowerCase() as NodeType,
              );

              return (
                <motion.div
                  key={`step-${activeStep}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                        Step {stepData.step} of 4
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {logostore.flow_story.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-lg font-bold text-foreground">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase",
                          fromDetails?.bg,
                          fromDetails?.color,
                        )}
                      >
                        {stepData.from}
                      </span>
                      <IconArrowRightDir className="size-4 text-muted-foreground" />
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase",
                          toDetails?.bg,
                          toDetails?.color,
                        )}
                      >
                        {stepData.to}
                      </span>
                    </div>

                    <p className="text-base leading-relaxed text-foreground/90 font-medium pt-2">
                      {stepData.meaning}
                    </p>
                  </div>

                  {/* Interactive flow connector visual details */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/20">
                    {fromDetails && (
                      <div className="flex items-center gap-2">
                        <div className="relative size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/10">
                          <Image
                            src={fromDetails.svg}
                            alt={stepData.from}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            From
                          </p>
                          <p className="text-xs font-bold text-foreground truncate">
                            {fromDetails.data.role}
                          </p>
                        </div>
                      </div>
                    )}
                    {toDetails && (
                      <div className="flex items-center gap-2">
                        <div className="relative size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/10">
                          <Image
                            src={toDetails.svg}
                            alt={stepData.to}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            To
                          </p>
                          <p className="text-xs font-bold text-foreground truncate">
                            {toDetails.data.role}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()
          )}
        </AnimatePresence>

        {/* Timeline Flow Controller */}
        <div className="mt-8 flex items-center justify-between border-t border-border/20 pt-4 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevStep}
              className="p-2 rounded-lg border border-border bg-card/20 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
              aria-label="Previous step"
            >
              <IconArrowLeft className="size-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200",
                isPlaying
                  ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                  : "border-border bg-card/20 text-muted-foreground hover:text-foreground",
              )}
            >
              {isPlaying ? (
                <>
                  <IconPlayerPause className="size-3.5 shrink-0" />
                  <span>Pause Flow</span>
                </>
              ) : (
                <>
                  <IconPlayerPlay className="size-3.5 shrink-0 animate-pulse" />
                  <span>Autoplay Loop</span>
                </>
              )}
            </button>
            <button
              onClick={handleNextStep}
              className="p-2 rounded-lg border border-border bg-card/20 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
              aria-label="Next step"
            >
              <IconArrowRight className="size-4" />
            </button>
          </div>

          {/* Step indicator dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: stepsCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleStepClick(idx)}
                className={cn(
                  "size-2.5 rounded-full transition-all duration-300",
                  activeStep === idx
                    ? "bg-primary w-6"
                    : "bg-border/60 hover:bg-muted-foreground/50",
                )}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
