"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  IconSchool,
  IconBriefcase,
  IconUsers,
  IconActivity,
} from "@tabler/icons-react";
import { branding } from "@/config/brand.config";
import { NodeType } from "@/components/logo-story/types-and-helpers";
import { authNodeInfo } from "@/lib/shared/auth-sidebar.utils";

interface AuthSidebarProps {
  defaultTitle: string;
  defaultDesc: string;
}

export function AuthSidebar({ defaultTitle, defaultDesc }: AuthSidebarProps) {
  const [hoveredNode, setHoveredNode] = useState<NodeType | null>(null);

  return (
    <div className="hidden lg:col-span-6 lg:flex flex-col justify-between p-12 border-r border-border/40 relative bg-linear-to-b from-primary/5 to-transparent">
      {/* Top Logo */}
      <div className="flex items-center gap-2">
        <div className="relative size-9 flex items-center justify-center rounded-xl bg-background shadow-md border border-border/40">
          <Image
            src={branding.logo}
            alt="Logo"
            width={20}
            height={20}
            className="size-5"
          />
        </div>
        <span className="text-base font-bold tracking-tight text-foreground bg-linear-to-r from-foreground to-foreground/80 bg-clip-text">
          {branding.title}
        </span>
      </div>

      {/* Interactive Concentric Diagram (Opportunity Loop) */}
      <div className="my-10 relative flex justify-center items-center py-6">
        <div className="relative size-60 flex items-center justify-center border border-border/30 rounded-full bg-background/10 backdrop-blur-xs">
          {/* Grid Lines */}
          <div className="absolute inset-x-0 h-px bg-border/20" />
          <div className="absolute inset-y-0 w-px bg-border/20" />

          {/* Rotating Outer Ring */}
          <svg
            className="absolute size-52 animate-spin"
            style={{ animationDuration: "25s" }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted-foreground/10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="1.2"
              strokeDasharray="12 28"
              className="opacity-60"
            />
          </svg>

          {/* Inverse Ring */}
          <svg
            className="absolute size-40 animate-spin"
            style={{ animationDuration: "18s", animationDirection: "reverse" }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-secondary)"
              strokeWidth="0.8"
              strokeDasharray="18 42"
              className="opacity-40"
            />
          </svg>

          {/* Central Logo Spiral Element */}
          <div className="relative size-16 flex items-center justify-center rounded-2xl bg-background shadow-md border border-border/40">
            <Image
              src={branding.logo}
              alt="GigHub Logo"
              width={36}
              height={36}
              className="size-9 opacity-80"
            />
          </div>

          {/* Interactive Pillars (Hover Nodes) */}
          {/* 1. University (Top-Left) */}
          <button
            type="button"
            onMouseEnter={() => setHoveredNode("university")}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute -top-3 left-[calc(50%-18px)] size-9 flex items-center justify-center rounded-full border bg-background shadow-sm transition-all duration-300 outline-none ${
              hoveredNode === "university" ? "border-emerald-500 ring-4 ring-emerald-500/20 scale-110" : "border-border"
            }`}
          >
            <IconSchool className="size-4.5 text-emerald-500" />
          </button>

          {/* 2. Work (Top-Right) */}
          <button
            type="button"
            onMouseEnter={() => setHoveredNode("work")}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute top-[calc(50%-18px)] -right-3 size-9 flex items-center justify-center rounded-full border bg-background shadow-sm transition-all duration-300 outline-none ${
              hoveredNode === "work" ? "border-blue-500 ring-4 ring-blue-500/20 scale-110" : "border-border"
            }`}
          >
            <IconBriefcase className="size-4.5 text-blue-500" />
          </button>

          {/* 3. Collaboration (Bottom-Right) */}
          <button
            type="button"
            onMouseEnter={() => setHoveredNode("collaboration")}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute -bottom-3 left-[calc(50%-18px)] size-9 flex items-center justify-center rounded-full border bg-background shadow-sm transition-all duration-300 outline-none ${
              hoveredNode === "collaboration" ? "border-red-500 ring-4 ring-red-500/20 scale-110" : "border-border"
            }`}
          >
            <IconUsers className="size-4.5 text-red-500" />
          </button>

          {/* 4. Student (Bottom-Left) */}
          <button
            type="button"
            onMouseEnter={() => setHoveredNode("student")}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute top-[calc(50%-18px)] -left-3 size-9 flex items-center justify-center rounded-full border bg-background shadow-sm transition-all duration-300 outline-none ${
              hoveredNode === "student" ? "border-amber-500 ring-4 ring-amber-500/20 scale-110" : "border-border"
            }`}
          >
            <IconActivity className="size-4.5 text-amber-500" />
          </button>
        </div>
      </div>

      {/* Dynamic Descriptive Panel */}
      <div className="h-28 flex flex-col justify-end text-balance">
        <AnimatePresence mode="wait">
          {hoveredNode ? (
            <motion.div
              key={hoveredNode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className={`inline-block size-2 rounded-full ${authNodeInfo[hoveredNode].color.replace("text-", "bg-")}`} />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${authNodeInfo[hoveredNode].color}`}>
                  {authNodeInfo[hoveredNode].title}
                </h3>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {authNodeInfo[hoveredNode].desc}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <h2
                className="text-2xl font-semibold leading-tight tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                {defaultTitle}
              </h2>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {defaultDesc}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer tagline */}
      <span className="text-xs text-muted-foreground/60 mt-4 block">
        Exclusive campus ecosystem &bull; JnU, Dhaka
      </span>
    </div>
  );
}
