"use client";

import { cn } from "@/lib/utils";
import { IconClick } from "@tabler/icons-react";
import { motion } from "motion/react";
import Image from "next/image";
import { NodeType } from "./types-and-helpers";

interface EcosystemPlaygroundProps {
  hoveredNode: NodeType | "spiral" | null;
  setHoveredNode: (node: NodeType | "spiral" | null) => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export function EcosystemPlayground({
  hoveredNode,
  setHoveredNode,
  activeStep,
  setActiveStep,
  setIsPlaying,
}: EcosystemPlaygroundProps) {
  // Helper to check if a node is visually active (hovered or represents current step)
  const isUniversityActive =
    hoveredNode === "university" || (hoveredNode === null && activeStep === 0);
  const isStudentActive =
    hoveredNode === "student" || (hoveredNode === null && activeStep === 1);
  const isWorkActive =
    hoveredNode === "work" || (hoveredNode === null && activeStep === 2);
  const isCollaborationActive =
    hoveredNode === "collaboration" ||
    (hoveredNode === null && activeStep === 3);

  return (
    <div className="lg:col-span-6 flex flex-col items-center">
      <div className="relative w-full max-w-115 aspect-square rounded-full border border-border/30 bg-card/10 p-6 md:p-10 flex items-center justify-center shadow-2xl backdrop-blur-xs">
        {/* Dynamic SVG Connections Overlay */}
        <svg
          viewBox="0 0 500 500"
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        >
          {/* Connection Paths (Grey bases) */}
          {/* University -> Student (Left Outer Curve) */}
          <path
            d="M 120 120 A 180 180 0 0 0 120 380"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="3"
            strokeDasharray="4 6"
            opacity="0.3"
          />
          {/* Student -> Work (Diagonal Up-Right Curve) */}
          <path
            d="M 120 380 C 130 230, 230 130, 380 120"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="3"
            strokeDasharray="4 6"
            opacity="0.3"
          />
          {/* Work -> Collaboration (Right Outer Curve) */}
          <path
            d="M 380 120 A 180 180 0 0 0 380 380"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="3"
            strokeDasharray="4 6"
            opacity="0.3"
          />
          {/* Collaboration -> University (Diagonal Up-Left Curve) */}
          <path
            d="M 380 380 C 370 230, 230 130, 120 120"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="3"
            strokeDasharray="4 6"
            opacity="0.3"
          />

          {/* Animated Glowing Active Connections */}
          {/* Step 1: University -> Student */}
          <motion.path
            d="M 120 120 A 180 180 0 0 0 120 380"
            fill="none"
            stroke="#10b981" // Emerald
            strokeWidth="4"
            strokeLinecap="round"
            initial={{
              strokeDasharray: "10 15",
              strokeDashoffset: 0,
              opacity: 0,
            }}
            animate={{
              opacity: activeStep === 0 ? 1 : 0.1,
              strokeDashoffset: activeStep === 0 ? [-100, 0] : 0,
            }}
            transition={{
              strokeDashoffset: {
                repeat: Infinity,
                ease: "linear",
                duration: 3,
              },
              opacity: { duration: 0.5 },
            }}
          />

          {/* Step 2: Student -> Work */}
          <motion.path
            d="M 120 380 C 130 230, 230 130, 380 120"
            fill="none"
            stroke="#3b82f6" // Blue
            strokeWidth="4"
            strokeLinecap="round"
            initial={{
              strokeDasharray: "10 15",
              strokeDashoffset: 0,
              opacity: 0,
            }}
            animate={{
              opacity: activeStep === 1 ? 1 : 0.1,
              strokeDashoffset: activeStep === 1 ? [-100, 0] : 0,
            }}
            transition={{
              strokeDashoffset: {
                repeat: Infinity,
                ease: "linear",
                duration: 3.5,
              },
              opacity: { duration: 0.5 },
            }}
          />

          {/* Step 3: Work -> Collaboration */}
          <motion.path
            d="M 380 120 A 180 180 0 0 0 380 380"
            fill="none"
            stroke="#ef4444" // Red
            strokeWidth="4"
            strokeLinecap="round"
            initial={{
              strokeDasharray: "10 15",
              strokeDashoffset: 0,
              opacity: 0,
            }}
            animate={{
              opacity: activeStep === 2 ? 1 : 0.1,
              strokeDashoffset: activeStep === 2 ? [-100, 0] : 0,
            }}
            transition={{
              strokeDashoffset: {
                repeat: Infinity,
                ease: "linear",
                duration: 3,
              },
              opacity: { duration: 0.5 },
            }}
          />

          {/* Step 4: Collaboration -> University */}
          <motion.path
            d="M 380 380 C 370 230, 230 130, 120 120"
            fill="none"
            stroke="#f59e0b" // Amber
            strokeWidth="4"
            strokeLinecap="round"
            initial={{
              strokeDasharray: "10 15",
              strokeDashoffset: 0,
              opacity: 0,
            }}
            animate={{
              opacity: activeStep === 3 ? 1 : 0.1,
              strokeDashoffset: activeStep === 3 ? [-100, 0] : 0,
            }}
            transition={{
              strokeDashoffset: {
                repeat: Infinity,
                ease: "linear",
                duration: 3.5,
              },
              opacity: { duration: 0.5 },
            }}
          />
        </svg>

        {/* Center Spiral */}
        <motion.div
          onMouseEnter={() => setHoveredNode("spiral")}
          onMouseLeave={() => setHoveredNode(null)}
          animate={{
            scale: hoveredNode === "spiral" ? 1.05 : 1,
          }}
          transition={{
            scale: { duration: 0.3 },
          }}
          className={cn(
            "relative z-10 size-32 md:size-44 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 bg-card/60 border shadow-md",
            hoveredNode === "spiral"
              ? "border-primary/50 shadow-primary/20 shadow-lg scale-105"
              : "border-border/40",
          )}
        >
          <div className="absolute inset-2 overflow-hidden rounded-full bg-radial from-transparent to-primary/5 opacity-80" />
          <Image
            src="/logo-story/Spiral.svg"
            alt="GigHub Logo Center Spiral"
            width={140}
            height={140}
            className="size-[80%] object-contain"
          />
        </motion.div>

        {/* Node 1: University (Top-Left) */}
        <motion.div
          onMouseEnter={() => {
            setHoveredNode("university");
            setIsPlaying(false);
          }}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => {
            setIsPlaying(false);
            setActiveStep(0);
          }}
          animate={{
            scale:
              hoveredNode === "university"
                ? 1.12
                : isUniversityActive
                  ? 1.05
                  : 1,
          }}
          className={cn(
            "absolute z-20 left-4 top-4 md:left-8 md:top-8 size-16 md:size-24 rounded-2xl border bg-card/80 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md",
            isUniversityActive
              ? "border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.25)] scale-110"
              : "border-border/40 hover:border-emerald-500/40",
          )}
        >
          <Image
            src="/logo-story/University.svg"
            alt="University Node"
            width={64}
            height={64}
            className="size-[65%] object-contain"
          />
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-semibold text-muted-foreground whitespace-nowrap">
            University
          </span>
        </motion.div>

        {/* Node 2: Student (Bottom-Left) */}
        <motion.div
          onMouseEnter={() => {
            setHoveredNode("student");
            setIsPlaying(false);
          }}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => {
            setIsPlaying(false);
            setActiveStep(1);
          }}
          animate={{
            scale:
              hoveredNode === "student" ? 1.12 : isStudentActive ? 1.05 : 1,
          }}
          className={cn(
            "absolute z-20 left-4 bottom-4 md:left-8 md:bottom-8 size-16 md:size-24 rounded-2xl border bg-card/80 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md",
            isStudentActive
              ? "border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.25)] scale-110"
              : "border-border/40 hover:border-blue-500/40",
          )}
        >
          <Image
            src="/logo-story/student.svg"
            alt="Student Node"
            width={64}
            height={64}
            className="size-[65%] object-contain"
          />
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Student
          </span>
        </motion.div>

        {/* Node 3: Work (Top-Right) */}
        <motion.div
          onMouseEnter={() => {
            setHoveredNode("work");
            setIsPlaying(false);
          }}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => {
            setIsPlaying(false);
            setActiveStep(2);
          }}
          animate={{
            scale: hoveredNode === "work" ? 1.12 : isWorkActive ? 1.05 : 1,
          }}
          className={cn(
            "absolute z-20 right-4 top-4 md:right-8 md:top-8 size-16 md:size-24 rounded-2xl border bg-card/80 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md",
            isWorkActive
              ? "border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)] scale-110"
              : "border-border/40 hover:border-red-500/40",
          )}
        >
          <Image
            src="/logo-story/Work.svg"
            alt="Work Node"
            width={64}
            height={64}
            className="size-[65%] object-contain"
          />
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Work
          </span>
        </motion.div>

        {/* Node 4: Collaboration (Bottom-Right) */}
        <motion.div
          onMouseEnter={() => {
            setHoveredNode("collaboration");
            setIsPlaying(false);
          }}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => {
            setIsPlaying(false);
            setActiveStep(3);
          }}
          animate={{
            scale:
              hoveredNode === "collaboration"
                ? 1.12
                : isCollaborationActive
                  ? 1.05
                  : 1,
          }}
          className={cn(
            "absolute z-20 right-4 bottom-4 md:right-8 md:bottom-8 size-16 md:size-24 rounded-2xl border bg-card/80 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md",
            isCollaborationActive
              ? "border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-110"
              : "border-border/40 hover:border-amber-500/40",
          )}
        >
          <Image
            src="/logo-story/Collaboration.svg"
            alt="Collaboration Node"
            width={64}
            height={64}
            className="size-[65%] object-contain"
          />
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Collaboration
          </span>
        </motion.div>
      </div>

      {/* Quick interactive hint */}
      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground select-none">
        <IconClick className="size-3.5 text-primary" />
        Hover nodes or use step control below to unfold the story
      </p>
    </div>
  );
}
