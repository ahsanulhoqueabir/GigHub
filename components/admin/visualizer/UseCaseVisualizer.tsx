/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  UCActor,
  UCRelation,
  UCUseCase,
  serializePlantUML,
} from "@/lib/schema-parser";
import {
  IconBriefcase,
  IconBuilding,
  IconCopy,
  IconEye,
  IconFilter,
  IconHierarchy,
  IconMail,
  IconPlus,
  IconShield,
  IconShoppingCart,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseCaseVisualizerProps {
  actors: UCActor[];
  useCases: UCUseCase[];
  relations: UCRelation[];
  onChange: (
    actors: UCActor[],
    useCases: UCUseCase[],
    relations: UCRelation[],
  ) => void;
}

const ACTOR_ICONS: Record<string, React.ElementType> = {
  Guest: IconUser,
  Buyer: IconShoppingCart,
  Seller: IconBriefcase,
  JobOwner: IconBuilding,
  Applicant: IconMail,
  Admin: IconShield,
  Moderator: IconEye,
};

export function UseCaseVisualizer({
  actors,
  useCases,
  relations,
  onChange,
}: UseCaseVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<
    Record<string, { x: number; y: number; w: number; h: number }>
  >({});
  const [hoveredNode, setHoveredNode] = useState<{
    type: "actor" | "uc";
    id: string;
  } | null>(null);
  const [hoveredRelation, setHoveredRelation] = useState<string | null>(null);
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);

  // Find all ancestors of an actor (handling inheritance)
  const getActorAncestors = (actId: string): Set<string> => {
    const ancestors = new Set<string>([actId]);
    let current = actors.find((a) => a.id === actId);
    while (current && current.parentId) {
      const parentId = current.parentId;
      if (ancestors.has(parentId)) break; // prevent cycles
      ancestors.add(parentId);
      current = actors.find((a) => a.id === parentId);
    }
    return ancestors;
  };

  // Find all use cases associated with an actor (directly or through ancestors)
  const getAllowedUseCases = (actId: string): Set<string> => {
    const ancestors = getActorAncestors(actId);
    const allowed = new Set<string>();

    // 1. Add direct associations
    relations.forEach((rel) => {
      if (rel.type === "association") {
        if (ancestors.has(rel.source)) {
          allowed.add(rel.target);
        } else if (ancestors.has(rel.target)) {
          allowed.add(rel.source);
        }
      }
    });

    // 2. Transitive include/extend linkages
    let added = true;
    while (added) {
      added = false;
      relations.forEach((rel) => {
        if (rel.type === "include" || rel.type === "extend") {
          if (allowed.has(rel.source) && !allowed.has(rel.target)) {
            allowed.add(rel.target);
            added = true;
          }
          if (allowed.has(rel.target) && !allowed.has(rel.source)) {
            allowed.add(rel.source);
            added = true;
          }
        }
      });
    }

    return allowed;
  };

  const allowedUcs = selectedActorId
    ? getAllowedUseCases(selectedActorId)
    : null;
  const selectedAncestors = selectedActorId
    ? getActorAncestors(selectedActorId)
    : null;

  // Form states for creating/editing items
  const [activePanel, setActivePanel] = useState<
    "add-actor" | "add-uc" | "add-relation" | "none"
  >("none");
  const [newActor, setNewActor] = useState({
    label: "",
    id: "",
    side: "left" as "left" | "right",
    parentId: "",
  });
  const categories = Array.from(
    new Set(useCases.map((uc) => uc.category)),
  ).filter(Boolean);
  if (categories.length === 0) categories.push("General");

  const [newUc, setNewUc] = useState({
    label: "",
    id: "",
    category: categories[0],
  });
  const [newRel, setNewRel] = useState({
    source: "",
    target: "",
    type: "association" as any,
    label: "",
  });

  useEffect(() => {
    // Measure elements to draw SVG connections
    const updateCoordinates = () => {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const newCoords: typeof coords = {};

      actors.forEach((actor) => {
        const el = document.getElementById(`node-actor-${actor.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          newCoords[`actor-${actor.id}`] = {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            w: rect.width,
            h: rect.height,
          };
        }
      });

      useCases.forEach((uc) => {
        const el = document.getElementById(`node-uc-${uc.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          newCoords[`uc-${uc.id}`] = {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            w: rect.width,
            h: rect.height,
          };
        }
      });

      setCoords(newCoords);
    };

    updateCoordinates();
    window.addEventListener("resize", updateCoordinates);
    // Extra triggers to account for layout shifts and animations
    const timer1 = setTimeout(updateCoordinates, 100);
    const timer2 = setTimeout(updateCoordinates, 500);

    return () => {
      window.removeEventListener("resize", updateCoordinates);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [actors, useCases, relations]);

  // Highlight logic helper
  const isRelationHighlighted = (rel: UCRelation) => {
    if (hoveredRelation === rel.id) return true;
    if (!hoveredNode) return false;

    if (hoveredNode.type === "actor") {
      // Highlight direct links or connections originating from actor
      return rel.source === hoveredNode.id || rel.target === hoveredNode.id;
    }

    if (hoveredNode.type === "uc") {
      // Highlight direct connections or include/extends
      return rel.source === hoveredNode.id || rel.target === hoveredNode.id;
    }

    return false;
  };

  const isNodeHighlighted = (nodeType: "actor" | "uc", id: string) => {
    if (!hoveredNode) return true; // defaults to active/bright if no hover
    if (hoveredNode.type === nodeType && hoveredNode.id === id) return true;

    // Check if this node is connected to the hovered node
    return relations.some((rel) => {
      if (!isRelationHighlighted(rel)) return false;
      return (
        (rel.source === id && rel.target === hoveredNode.id) ||
        (rel.target === id && rel.source === hoveredNode.id)
      );
    });
  };

  // Mutator functions for customization
  const handleAddActor = () => {
    if (!newActor.label.trim()) {
      toast.error("Actor name is required");
      return;
    }
    const id = newActor.id.trim() || newActor.label.replace(/\s+/g, "");
    if (actors.some((a) => a.id === id)) {
      toast.error("Actor ID must be unique");
      return;
    }

    const updatedActors = [
      ...actors,
      {
        id,
        label: newActor.label,
        side: newActor.side,
        parentId: newActor.parentId || null,
      },
    ];

    const updatedRelations = [...relations];
    if (newActor.parentId) {
      updatedRelations.push({
        id: `${id}-inherits-${newActor.parentId}`,
        source: id,
        target: newActor.parentId,
        type: "inheritance",
      });
    }

    onChange(updatedActors, useCases, updatedRelations);
    setNewActor({ label: "", id: "", side: "left", parentId: "" });
    setActivePanel("none");
    toast.success("Actor added successfully");
  };

  const handleAddUc = () => {
    if (!newUc.label.trim()) {
      toast.error("Use case name is required");
      return;
    }
    const id = newUc.id.trim() || `UC_${newUc.label.replace(/\s+/g, "")}`;
    if (useCases.some((uc) => uc.id === id)) {
      toast.error("Use Case ID must be unique");
      return;
    }

    const updatedUcs = [
      ...useCases,
      {
        id,
        label: newUc.label,
        category: newUc.category,
      },
    ];

    onChange(actors, updatedUcs, relations);
    setNewUc({ label: "", id: "", category: "Core" });
    setActivePanel("none");
    toast.success("Use Case added successfully");
  };

  const handleAddRelation = () => {
    if (!newRel.source || !newRel.target) {
      toast.error("Please select both source and target");
      return;
    }
    if (newRel.source === newRel.target) {
      toast.error("Source and target cannot be the same node");
      return;
    }

    const relId = `${newRel.source}-${newRel.type}-${newRel.target}`;
    if (relations.some((r) => r.id === relId)) {
      toast.error("This relation already exists");
      return;
    }

    const updatedRels = [
      ...relations,
      {
        id: relId,
        source: newRel.source,
        target: newRel.target,
        type: newRel.type,
        label: newRel.label ? `<<${newRel.label}>>` : undefined,
      },
    ];

    onChange(actors, useCases, updatedRels);
    setNewRel({ source: "", target: "", type: "association", label: "" });
    setActivePanel("none");
    toast.success("Relation added successfully");
  };

  const handleDeleteActor = (id: string) => {
    const updatedActors = actors.filter((a) => a.id !== id);
    const updatedRels = relations.filter(
      (r) => r.source !== id && r.target !== id,
    );
    onChange(updatedActors, useCases, updatedRels);
    toast.success("Actor removed");
  };

  const handleDeleteUc = (id: string) => {
    const updatedUcs = useCases.filter((uc) => uc.id !== id);
    const updatedRels = relations.filter(
      (r) => r.source !== id && r.target !== id,
    );
    onChange(actors, updatedUcs, updatedRels);
    toast.success("Use Case removed");
  };

  const handleDeleteRelation = (id: string) => {
    const updatedRels = relations.filter((r) => r.id !== id);
    onChange(actors, useCases, updatedRels);
    toast.success("Relation removed");
  };

  const handleCopyPlantUML = () => {
    const puml = serializePlantUML(actors, useCases, relations);
    navigator.clipboard.writeText(puml);
    toast.success("PlantUML copied to clipboard!");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-12rem)] min-h-125">
      {/* Visual Canvas Panel */}
      <div
        className="flex-1 bg-accent/5 rounded-xl border border-border/60 relative overflow-auto p-8 flex flex-col justify-between"
        ref={containerRef}
      >
        {/* Dynamic SVG Connections layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                fill="var(--color-primary, #3b82f6)"
              />
            </marker>
            <marker
              id="arrow-dashed"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 2 L 8 5 L 0 8 z"
                fill="var(--color-muted-foreground, #6b7280)"
              />
            </marker>
            <marker
              id="inheritance"
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <polygon
                points="0,2 10,6 0,10"
                fill="none"
                stroke="var(--color-primary, #3b82f6)"
                strokeWidth="1.5"
              />
            </marker>
          </defs>

          {relations.map((rel) => {
            const isLeftActorSource = actors.some(
              (a) => a.id === rel.source && a.side === "left",
            );
            const isRightActorSource = actors.some(
              (a) => a.id === rel.source && a.side === "right",
            );
            const isActorTarget = actors.some((a) => a.id === rel.target);

            // Filter out relations if an actor is selected and this relation is not relevant to it
            if (selectedActorId && selectedAncestors && allowedUcs) {
              if (rel.type === "inheritance") {
                if (
                  !selectedAncestors.has(rel.source) ||
                  !selectedAncestors.has(rel.target)
                ) {
                  return null;
                }
              } else if (rel.type === "association") {
                const connectsToActor =
                  selectedAncestors.has(rel.source) ||
                  selectedAncestors.has(rel.target);
                const connectsToUc =
                  allowedUcs.has(rel.source) || allowedUcs.has(rel.target);
                if (!connectsToActor || !connectsToUc) {
                  return null;
                }
              } else {
                if (
                  !allowedUcs.has(rel.source) ||
                  !allowedUcs.has(rel.target)
                ) {
                  return null;
                }
              }
            }

            let sourceKey = "";
            let targetKey = "";

            if (isLeftActorSource || isRightActorSource) {
              sourceKey = `actor-${rel.source}`;
              targetKey = `uc-${rel.target}`;
            } else if (isActorTarget) {
              sourceKey = `actor-${rel.target}`;
              targetKey = `uc-${rel.source}`;
            } else {
              // UseCase to UseCase
              sourceKey = `uc-${rel.source}`;
              targetKey = `uc-${rel.target}`;
            }

            const c1 = coords[sourceKey];
            const c2 = coords[targetKey];

            if (!c1 || !c2) return null;

            let x1 = 0,
              y1 = 0,
              x2 = 0,
              y2 = 0;

            if (isLeftActorSource) {
              // Left actor to UC: right center to left center
              x1 = c1.x + c1.w;
              y1 = c1.y + c1.h / 2;
              x2 = c2.x;
              y2 = c2.y + c2.h / 2;
            } else if (isRightActorSource) {
              // Right actor to UC: left center to right center
              x1 = c1.x;
              y1 = c1.y + c1.h / 2;
              x2 = c2.x + c2.w;
              y2 = c2.y + c2.h / 2;
            } else {
              // UC to UC or reversed
              // Check relative horizontal position
              if (c1.x + c1.w < c2.x) {
                x1 = c1.x + c1.w;
                y1 = c1.y + c1.h / 2;
                x2 = c2.x;
                y2 = c2.y + c2.h / 2;
              } else if (c2.x + c2.w < c1.x) {
                x1 = c1.x;
                y1 = c1.y + c1.h / 2;
                x2 = c2.x + c2.w;
                y2 = c2.y + c2.h / 2;
              } else {
                // Vertical alignment
                x1 = c1.x + c1.w / 2;
                y1 = c1.y + (c1.y < c2.y ? c1.h : 0);
                x2 = c2.x + c2.w / 2;
                y2 = c2.y + (c1.y < c2.y ? 0 : c2.h);
              }
            }

            const dx = Math.abs(x2 - x1) * 0.45;
            let path = "";

            if (isLeftActorSource) {
              path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
            } else if (isRightActorSource) {
              path = `M ${x1} ${y1} C ${x1 - dx} ${y1}, ${x2 + dx} ${y2}, ${x2} ${y2}`;
            } else {
              // Smooth S-curve
              path = `M ${x1} ${y1} C ${x1 + (x1 < x2 ? dx : -dx)} ${y1}, ${x2 + (x1 < x2 ? -dx : dx)} ${y2}, ${x2} ${y2}`;
            }

            const active = hoveredNode ? isRelationHighlighted(rel) : true;
            const highlighted = hoveredNode && isRelationHighlighted(rel);

            let stroke = "var(--color-border, #e5e7eb)";
            let strokeWidth = 1.5;
            let dashArray = "";
            let marker = "url(#arrow)";

            if (rel.type === "include" || rel.type === "extend") {
              dashArray = "4, 4";
              stroke = "var(--color-muted-foreground, #6b7280)";
              marker = "url(#arrow-dashed)";
            } else if (rel.type === "inheritance") {
              stroke = "var(--color-primary, #3b82f6)";
              marker = "url(#inheritance)";
              strokeWidth = 1.75;
            }

            if (hoveredNode) {
              if (highlighted) {
                stroke = "var(--color-primary, #3b82f6)";
                strokeWidth = 2.5;
              } else {
                stroke = "var(--color-border, #e5e7eb)";
                strokeWidth = 0.5;
              }
            }

            return (
              <g
                key={rel.id}
                className="transition-all duration-200"
                onMouseEnter={() => setHoveredRelation(rel.id)}
                onMouseLeave={() => setHoveredRelation(null)}
              >
                <path
                  d={path}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  markerEnd={marker}
                  className="transition-all duration-200"
                  style={{ opacity: active ? 1 : 0.15 }}
                />
                {/* Invisible wider path for easier hovering */}
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={10}
                  className="cursor-pointer pointer-events-auto"
                />
              </g>
            );
          })}
        </svg>

        {/* HTML Labels Overlaid on SVG Paths */}
        {relations.map((rel) => {
          if (rel.type !== "include" && rel.type !== "extend") return null;

          // Filter out labels if actor is selected and not relevant
          if (selectedActorId && selectedAncestors && allowedUcs) {
            if (!allowedUcs.has(rel.source) || !allowedUcs.has(rel.target)) {
              return null;
            }
          }

          const isLeftActorSource = actors.some(
            (a) => a.id === rel.source && a.side === "left",
          );
          const isRightActorSource = actors.some(
            (a) => a.id === rel.source && a.side === "right",
          );
          const isActorTarget = actors.some((a) => a.id === rel.target);

          let sourceKey = "";
          let targetKey = "";

          if (isLeftActorSource || isRightActorSource) {
            sourceKey = `actor-${rel.source}`;
            targetKey = `uc-${rel.target}`;
          } else if (isActorTarget) {
            sourceKey = `actor-${rel.target}`;
            targetKey = `uc-${rel.source}`;
          } else {
            sourceKey = `uc-${rel.source}`;
            targetKey = `uc-${rel.target}`;
          }

          const c1 = coords[sourceKey];
          const c2 = coords[targetKey];

          if (!c1 || !c2) return null;

          // Simple midpoint coordinates
          let x1 = 0,
            y1 = 0,
            x2 = 0,
            y2 = 0;
          if (isLeftActorSource) {
            x1 = c1.x + c1.w;
            y1 = c1.y + c1.h / 2;
            x2 = c2.x;
            y2 = c2.y + c2.h / 2;
          } else if (isRightActorSource) {
            x1 = c1.x;
            y1 = c1.y + c1.h / 2;
            x2 = c2.x + c2.w;
            y2 = c2.y + c2.h / 2;
          } else {
            if (c1.x + c1.w < c2.x) {
              x1 = c1.x + c1.w;
              y1 = c1.y + c1.h / 2;
              x2 = c2.x;
              y2 = c2.y + c2.h / 2;
            } else if (c2.x + c2.w < c1.x) {
              x1 = c1.x;
              y1 = c1.y + c1.h / 2;
              x2 = c2.x + c2.w;
              y2 = c2.y + c2.h / 2;
            } else {
              x1 = c1.x + c1.w / 2;
              y1 = c1.y + (c1.y < c2.y ? c1.h : 0);
              x2 = c2.x + c2.w / 2;
              y2 = c2.y + (c1.y < c2.y ? 0 : c2.h);
            }
          }

          // Calculate visual midpoint on S-curve (rough approximation)
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          const isLineActive = hoveredNode ? isRelationHighlighted(rel) : true;

          return (
            <div
              key={`label-${rel.id}`}
              className="absolute pointer-events-none select-none z-30 text-[9px] font-mono px-1 py-0.5 rounded bg-background/95 border border-border shadow-xs text-muted-foreground transition-all duration-200"
              style={{
                left: `${midX}px`,
                top: `${midY}px`,
                transform: "translate(-50%, -50%)",
                opacity: isLineActive ? 0.9 : 0.1,
              }}
            >
              {rel.label || `<<${rel.type}>>`}
            </div>
          );
        })}

        {/* 3-Column Diagram Grid Layout */}
        <div className="grid grid-cols-5 gap-4 relative z-10 min-h-full items-stretch">
          {/* 1. Left Side Actors */}
          <div className="col-span-1 flex flex-col gap-6 justify-center items-start">
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">
              Left Actors
            </div>
            {actors
              .filter((a) => a.side === "left")
              .map((actor) => {
                const IconComponent = ACTOR_ICONS[actor.label] || IconUser;
                const isSelected = selectedActorId === actor.id;
                const isAncestor = selectedAncestors?.has(actor.id) || false;
                const isDimmed = selectedActorId && !isSelected && !isAncestor;
                const isLit = !isDimmed && isNodeHighlighted("actor", actor.id);
                return (
                  <div
                    key={actor.id}
                    id={`node-actor-${actor.id}`}
                    onMouseEnter={() =>
                      setHoveredNode({ type: "actor", id: actor.id })
                    }
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => {
                      if (selectedActorId === actor.id) {
                        setSelectedActorId(null);
                      } else {
                        setSelectedActorId(actor.id);
                      }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 w-full group select-none shadow-xs cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20 scale-102 font-bold"
                        : isDimmed
                          ? "opacity-25 border-border/20 hover:opacity-75"
                          : isLit
                            ? "border-border bg-card/60 hover:border-primary hover:shadow-md hover:-translate-y-0.5"
                            : "opacity-20 border-transparent"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate text-foreground">
                        {actor.label}
                      </div>
                      {actor.parentId && (
                        <div className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                          <IconHierarchy className="h-2.5 w-2.5" />
                          {actor.parentId}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* 2. Center Marketplace Boundary Box */}
          <div className="col-span-3 border border-border/80 bg-background/50 backdrop-blur-xs rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3 mb-2 shrink-0">
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                System Boundary
              </span>
              <span className="text-sm font-extrabold text-foreground px-3 py-1 bg-accent/20 rounded-full border border-border/50">
                Marketplace Platform
              </span>
            </div>

            {selectedActorId && (
              <div className="flex items-center justify-between text-xs px-3 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl shrink-0">
                <span className="flex items-center gap-1.5 font-medium">
                  <IconFilter className="h-3.5 w-3.5" />
                  Showing only functions for:{" "}
                  <strong className="underline decoration-wavy">
                    {actors.find((a) => a.id === selectedActorId)?.label ||
                      selectedActorId}
                  </strong>
                </span>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedActorId(null);
                  }}
                  className="h-6 px-2 text-[10px] text-primary hover:bg-primary/20 cursor-pointer"
                >
                  Show All
                </Button>
              </div>
            )}

            <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const catUcs = useCases.filter(
                  (uc) =>
                    uc.category === cat &&
                    (!allowedUcs || allowedUcs.has(uc.id)),
                );
                if (catUcs.length === 0) return null;

                return (
                  <div
                    key={cat}
                    className="border border-border/40 bg-accent/5 p-4 rounded-xl flex flex-col gap-3"
                  >
                    <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider border-b border-border/20 pb-1">
                      {cat}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {catUcs.map((uc) => {
                        const isLit = isNodeHighlighted("uc", uc.id);
                        return (
                          <div
                            key={uc.id}
                            id={`node-uc-${uc.id}`}
                            onMouseEnter={() =>
                              setHoveredNode({ type: "uc", id: uc.id })
                            }
                            onMouseLeave={() => setHoveredNode(null)}
                            className={`px-3 py-2 rounded-full border bg-card text-center text-xs font-medium cursor-pointer transition-all duration-300 shadow-2xs ${
                              isLit
                                ? "border-border hover:border-primary hover:shadow-xs hover:scale-103 text-foreground"
                                : "opacity-20 border-transparent text-muted-foreground"
                            }`}
                          >
                            {uc.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Right Side Actors */}
          <div className="col-span-1 flex flex-col gap-6 justify-center items-end">
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">
              Right Actors
            </div>
            {actors
              .filter((a) => a.side === "right")
              .map((actor) => {
                const IconComponent = ACTOR_ICONS[actor.label] || IconUser;
                const isSelected = selectedActorId === actor.id;
                const isAncestor = selectedAncestors?.has(actor.id) || false;
                const isDimmed = selectedActorId && !isSelected && !isAncestor;
                const isLit = !isDimmed && isNodeHighlighted("actor", actor.id);
                return (
                  <div
                    key={actor.id}
                    id={`node-actor-${actor.id}`}
                    onMouseEnter={() =>
                      setHoveredNode({ type: "actor", id: actor.id })
                    }
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => {
                      if (selectedActorId === actor.id) {
                        setSelectedActorId(null);
                      } else {
                        setSelectedActorId(actor.id);
                      }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 w-full group select-none shadow-xs cursor-pointer flex-row-reverse ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20 scale-102 font-bold"
                        : isDimmed
                          ? "opacity-25 border-border/20 hover:opacity-75"
                          : isLit
                            ? "border-border bg-card/60 hover:border-primary hover:shadow-md hover:-translate-y-0.5"
                            : "opacity-20 border-transparent"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-xs font-semibold truncate text-foreground">
                        {actor.label}
                      </div>
                      {actor.parentId && (
                        <div className="text-[9px] text-muted-foreground flex items-center justify-end gap-0.5 mt-0.5">
                          <IconHierarchy className="h-2.5 w-2.5" />
                          {actor.parentId}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Customize Panel (Sidebar) */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-4 h-full">
        {/* Helper Card */}
        <Card className="border-border/60 shadow-xs shrink-0">
          <CardHeader className="py-3 px-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                Controls
              </CardTitle>
              <Button
                size="xs"
                variant="outline"
                onClick={handleCopyPlantUML}
                className="h-7 text-[10px] gap-1 cursor-pointer"
              >
                <IconCopy className="h-3.5 w-3.5" />
                Copy PUML
              </Button>
            </div>
            <CardDescription className="text-xs mt-1">
              Add elements here. Updates are synced immediately. Copy the code
              to save manually in `.puml` files.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Accordion / Selector for editing */}
        <Card className="flex-1 border-border/60 shadow-xs overflow-hidden flex flex-col">
          <CardHeader className="py-3 px-4 border-b">
            <div className="flex items-center gap-1.5">
              <Button
                variant={activePanel === "add-actor" ? "default" : "outline"}
                size="sm"
                className="flex-1 h-8 text-[11px] cursor-pointer"
                onClick={() =>
                  setActivePanel(
                    activePanel === "add-actor" ? "none" : "add-actor",
                  )
                }
              >
                Actor
              </Button>
              <Button
                variant={activePanel === "add-uc" ? "default" : "outline"}
                size="sm"
                className="flex-1 h-8 text-[11px] cursor-pointer"
                onClick={() =>
                  setActivePanel(activePanel === "add-uc" ? "none" : "add-uc")
                }
              >
                Use Case
              </Button>
              <Button
                variant={activePanel === "add-relation" ? "default" : "outline"}
                size="sm"
                className="flex-1 h-8 text-[11px] cursor-pointer"
                onClick={() =>
                  setActivePanel(
                    activePanel === "add-relation" ? "none" : "add-relation",
                  )
                }
              >
                Relation
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {/* 1. Add Actor Panel */}
            {activePanel === "add-actor" && (
              <div className="p-4 border-b flex flex-col gap-3.5 shrink-0 bg-accent/5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Create New Actor
                </div>
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="actor-label"
                    className="text-[10px] font-medium"
                  >
                    Actor Name
                  </Label>
                  <Input
                    id="actor-label"
                    value={newActor.label}
                    onChange={(e) =>
                      setNewActor({ ...newActor, label: e.target.value })
                    }
                    placeholder="e.g. Premium Buyer"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="actor-side"
                      className="text-[10px] font-medium"
                    >
                      Placement Side
                    </Label>
                    <select
                      id="actor-side"
                      value={newActor.side}
                      onChange={(e) =>
                        setNewActor({
                          ...newActor,
                          side: e.target.value as any,
                        })
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
                    >
                      <option value="left">Left Side</option>
                      <option value="right">Right Side</option>
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="actor-parent"
                      className="text-[10px] font-medium"
                    >
                      Inherits From
                    </Label>
                    <select
                      id="actor-parent"
                      value={newActor.parentId}
                      onChange={(e) =>
                        setNewActor({ ...newActor, parentId: e.target.value })
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
                    >
                      <option value="">None</option>
                      {actors.map((act) => (
                        <option key={act.id} value={act.id}>
                          {act.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddActor}
                  className="h-8 text-xs cursor-pointer"
                >
                  <IconPlus className="h-3.5 w-3.5 mr-1" />
                  Add Actor
                </Button>
              </div>
            )}

            {/* 2. Add Use Case Panel */}
            {activePanel === "add-uc" && (
              <div className="p-4 border-b flex flex-col gap-3.5 shrink-0 bg-accent/5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Create Use Case
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="uc-label" className="text-[10px] font-medium">
                    Use Case Name
                  </Label>
                  <Input
                    id="uc-label"
                    value={newUc.label}
                    onChange={(e) =>
                      setNewUc({ ...newUc, label: e.target.value })
                    }
                    placeholder="e.g. Pay with Credit Card"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="uc-cat" className="text-[10px] font-medium">
                    Category Area
                  </Label>
                  <select
                    id="uc-cat"
                    value={newUc.category}
                    onChange={(e) =>
                      setNewUc({ ...newUc, category: e.target.value })
                    }
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none w-full"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddUc}
                  className="h-8 text-xs cursor-pointer"
                >
                  <IconPlus className="h-3.5 w-3.5 mr-1" />
                  Add Use Case
                </Button>
              </div>
            )}

            {/* 3. Add Relation Panel */}
            {activePanel === "add-relation" && (
              <div className="p-4 border-b flex flex-col gap-3.5 shrink-0 bg-accent/5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Add Connection Line
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="rel-src" className="text-[10px] font-medium">
                    Source Node
                  </Label>
                  <select
                    id="rel-src"
                    value={newRel.source}
                    onChange={(e) =>
                      setNewRel({ ...newRel, source: e.target.value })
                    }
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none w-full"
                  >
                    <option value="">-- Choose Actor or Use Case --</option>
                    <optgroup label="Actors">
                      {actors.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} ({a.side})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Use Cases">
                      {useCases.map((uc) => (
                        <option key={uc.id} value={uc.id}>
                          {uc.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="rel-tgt" className="text-[10px] font-medium">
                    Target Use Case
                  </Label>
                  <select
                    id="rel-tgt"
                    value={newRel.target}
                    onChange={(e) =>
                      setNewRel({ ...newRel, target: e.target.value })
                    }
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none w-full"
                  >
                    <option value="">-- Choose Target Use Case --</option>
                    {useCases.map((uc) => (
                      <option key={uc.id} value={uc.id}>
                        {uc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="rel-type"
                      className="text-[10px] font-medium"
                    >
                      Link Type
                    </Label>
                    <select
                      id="rel-type"
                      value={newRel.type}
                      onChange={(e) =>
                        setNewRel({ ...newRel, type: e.target.value as any })
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
                    >
                      <option value="association">Association (Solid)</option>
                      <option value="include">Include (Dashed)</option>
                      <option value="extend">Extend (Dashed)</option>
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="rel-lbl"
                      className="text-[10px] font-medium"
                    >
                      Label (Optional)
                    </Label>
                    <Input
                      id="rel-lbl"
                      value={newRel.label}
                      onChange={(e) =>
                        setNewRel({ ...newRel, label: e.target.value })
                      }
                      placeholder="e.g. include"
                      className="h-8 text-xs"
                      disabled={newRel.type === "association"}
                    />
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={handleAddRelation}
                  className="h-8 text-xs cursor-pointer"
                >
                  <IconPlus className="h-3.5 w-3.5 mr-1" />
                  Add Link
                </Button>
              </div>
            )}

            {/* List and manage existing elements */}
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-4">
                {/* Actors section */}
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Actors ({actors.length})
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {actors.map((actor) => (
                      <div
                        key={actor.id}
                        className="flex justify-between items-center text-xs p-2 rounded-lg border border-border/40 hover:bg-accent/10"
                      >
                        <span className="font-semibold text-foreground truncate max-w-37.5">
                          {actor.label}{" "}
                          <span className="text-[9px] font-normal text-muted-foreground">
                            ({actor.side})
                          </span>
                        </span>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleDeleteActor(actor.id)}
                          className="h-6 w-6 text-destructive hover:bg-destructive/10 cursor-pointer p-0 shrink-0"
                        >
                          <IconTrash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Cases section */}
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Use Cases ({useCases.length})
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {useCases.map((uc) => (
                      <div
                        key={uc.id}
                        className="flex justify-between items-center text-xs p-2 rounded-lg border border-border/40 hover:bg-accent/10"
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="font-semibold text-foreground truncate">
                            {uc.label}
                          </span>
                          <span className="text-[8px] text-muted-foreground truncate">
                            {uc.category}
                          </span>
                        </div>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleDeleteUc(uc.id)}
                          className="h-6 w-6 text-destructive hover:bg-destructive/10 cursor-pointer p-0 shrink-0"
                        >
                          <IconTrash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relations section */}
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Connections ({relations.length})
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {relations.map((rel) => {
                      const srcNode =
                        actors.find((a) => a.id === rel.source)?.label ||
                        useCases.find((u) => u.id === rel.source)?.label ||
                        rel.source;
                      const tgtNode =
                        useCases.find((u) => u.id === rel.target)?.label ||
                        actors.find((a) => a.id === rel.target)?.label ||
                        rel.target;
                      return (
                        <div
                          key={rel.id}
                          className="flex justify-between items-center text-[10px] p-2 rounded-lg border border-border/40 hover:bg-accent/10"
                        >
                          <div className="flex flex-col truncate pr-2">
                            <span className="font-semibold text-foreground truncate">
                              {srcNode}
                            </span>
                            <span className="text-[8px] text-muted-foreground truncate">
                              {rel.type === "inheritance"
                                ? "inherits from"
                                : rel.type === "include"
                                  ? "includes"
                                  : rel.type === "extend"
                                    ? "extends"
                                    : "associates with"}{" "}
                              {tgtNode}
                            </span>
                          </div>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleDeleteRelation(rel.id)}
                            className="h-6 w-6 text-destructive hover:bg-destructive/10 cursor-pointer p-0 shrink-0"
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
