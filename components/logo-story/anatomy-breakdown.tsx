"use client";

import { cn } from "@/lib/utils";
import {
  IconActivity,
  IconArrowRight,
  IconCircleCheck,
  IconCompass,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getNodeDetails, NodeType } from "./types-and-helpers";

export function AnatomyBreakdown() {
  const nodes: NodeType[] = useMemo(
    () => ["university", "work", "collaboration", "student"],
    [],
  );
  const [activeNode, setActiveNode] = useState<NodeType>("university");
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  // Auto-play cycling through nodes
  useEffect(() => {
    if (isAutoplayPaused) return;

    const interval = setInterval(() => {
      setActiveNode((prev) => {
        const currentIndex = nodes.indexOf(prev);
        const nextIndex = (currentIndex + 1) % nodes.length;
        return nodes[nextIndex];
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoplayPaused, nodes]);

  const activeDetails = getNodeDetails(activeNode);

  return (
    <div className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary mb-3">
          <IconActivity className="size-3.5 animate-pulse" />
          <span>Interactive Blueprint Explorer</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground bg-linear-to-b from-foreground to-foreground/80 bg-clip-text">
          Visual Anatomy Breakdown
        </h2>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
          An in-depth look at each corner node connecting the Jagannath
          University campus opportunity ecosystem.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-stretch">
        {/* Left Side: Connected Timeline Nodes */}
        <div className="lg:col-span-5 relative flex flex-col justify-center space-y-4 pl-4 sm:pl-8 py-2">
          {/* Timeline continuous gradient line */}
          <div className="absolute left-6.5 sm:left-10.5 top-8 bottom-8 w-0.5 bg-border" />

          {/* Active indicator bar tracking the selected node */}
          <div
            className="absolute left-6.25 sm:left-10.25 w-1 rounded-full transition-all duration-500 bg-linear-to-b"
            style={{
              height: "22%",
              top: `${nodes.indexOf(activeNode) * 24.5 + 4.5}%`,
              backgroundImage:
                activeNode === "university"
                  ? "linear-gradient(to bottom, var(--color-emerald-500), var(--color-emerald-500))"
                  : activeNode === "work"
                    ? "linear-gradient(to bottom, var(--color-red-500), var(--color-red-500))"
                    : activeNode === "collaboration"
                      ? "linear-gradient(to bottom, var(--color-amber-500), var(--color-amber-500))"
                      : "linear-gradient(to bottom, var(--color-blue-500), var(--color-blue-500))",
            }}
          />

          {nodes.map((node, index) => {
            const details = getNodeDetails(node);
            if (!details) return null;

            const isActive = activeNode === node;
            const stepNum = `0${index + 1}`;

            return (
              <button
                key={node}
                onClick={() => {
                  setActiveNode(node);
                  setIsAutoplayPaused(true);
                }}
                className={cn(
                  "group relative w-full text-left flex items-center gap-4 sm:gap-6 p-3 sm:p-4 rounded-2xl border transition-all duration-300 outline-hidden z-10",
                  isActive
                    ? "bg-card border-border/80 shadow-md scale-[1.02]"
                    : "bg-transparent border-transparent hover:bg-muted/10",
                )}
              >
                {/* Visual Step Marker */}
                <div
                  className={cn(
                    "flex items-center justify-center size-7 sm:size-9 rounded-full border text-[11px] font-mono transition-all duration-500 font-bold z-10 shrink-0",
                    isActive
                      ? cn(
                          "bg-background text-foreground shadow-xs border-primary/40",
                          details.color,
                        )
                      : "bg-background/40 text-muted-foreground border-border",
                  )}
                >
                  {stepNum}
                </div>

                {/* SVG Icon */}
                <div
                  className={cn(
                    "p-2 rounded-xl border transition-all duration-300",
                    isActive
                      ? cn(details.bg, details.border, "scale-110 shadow-xs")
                      : "bg-muted/20 border-transparent group-hover:bg-muted/40",
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

                {/* Text Content */}
                <div className="grow min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={cn(
                        "text-sm sm:text-base font-bold transition-colors truncate",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {node.charAt(0).toUpperCase() + node.slice(1)}
                    </h3>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/60 px-1.5 py-0.5 rounded-md shrink-0 sm:block hidden">
                      {details.data.position}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-primary/80 transition-colors">
                    {details.data.role}
                  </p>
                </div>

                {/* Arrow indicator */}
                <IconArrowRight
                  className={cn(
                    "size-4 shrink-0 transition-all duration-300",
                    isActive
                      ? "text-primary translate-x-0 opacity-100"
                      : "text-muted-foreground/30 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0",
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Right Side: Immersive Blueprint Showcase Screen */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-border/80 bg-card/30 backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden shadow-2xl min-h-115 md:min-h-105">
          {/* Blueprint CAD grid lines */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[24px_24px] opacity-25 pointer-events-none" />

          {/* Dynamic background glow based on node theme color */}
          <div
            className="absolute -right-16 -top-16 -z-10 size-64 rounded-full blur-3xl opacity-10 transition-all duration-700"
            style={{
              backgroundColor:
                activeNode === "university"
                  ? "var(--color-emerald-500)"
                  : activeNode === "work"
                    ? "var(--color-red-500)"
                    : activeNode === "collaboration"
                      ? "var(--color-amber-500)"
                      : "var(--color-blue-500)",
            }}
          />

          <AnimatePresence mode="wait">
            {activeDetails && (
              <motion.div
                key={activeNode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="h-full flex flex-col justify-between gap-6"
              >
                {/* Showcase Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/80 px-2 py-0.5 border border-border rounded bg-background/50">
                        Node: {activeNode.toUpperCase()}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/80 px-2 py-0.5 border border-border rounded bg-background/50">
                        Status: Active_Spec
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                      <IconCompass
                        className="size-3.5 animate-spin"
                        style={{ animationDuration: "8s" }}
                      />
                      <span>{activeDetails.data.position}</span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-1">
                        {activeNode.charAt(0).toUpperCase() +
                          activeNode.slice(1)}
                      </h3>
                      <p
                        className={cn(
                          "text-xs sm:text-sm font-bold uppercase tracking-wider",
                          activeDetails.color,
                        )}
                      >
                        Role: {activeDetails.data.role}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "p-3.5 rounded-2xl border bg-background/60 shadow-xs",
                        activeDetails.border,
                      )}
                    >
                      <Image
                        src={activeDetails.svg}
                        alt={activeDetails.data.role}
                        width={40}
                        height={40}
                        className="size-10 object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Meaning List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Ecosystem Meaning & Function
                  </h4>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {activeDetails.data.meaning.map((pt, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground bg-background/30 p-2.5 rounded-lg border border-border/40 hover:bg-background/60 transition-colors"
                      >
                        <IconCircleCheck
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            activeDetails.color,
                          )}
                        />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Rationale */}
                <div className="pt-4 border-t border-border/60">
                  <div className="rounded-xl bg-muted/30 border-l-2 border-primary/60 p-4 relative overflow-hidden">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">
                      Visual Design Rationale
                    </span>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {activeDetails.data.reason_for_position}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
