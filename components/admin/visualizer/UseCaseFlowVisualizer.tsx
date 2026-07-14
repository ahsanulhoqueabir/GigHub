/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UCActor, UCRelation, UCUseCase } from "@/lib/schema-parser";
import {
  IconBriefcase,
  IconBuilding,
  IconEye,
  IconFilter,
  IconHierarchy,
  IconMail,
  IconShield,
  IconShoppingCart,
  IconUser,
} from "@tabler/icons-react";
import {
  Background,
  BaseEdge,
  Controls,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  Handle,
  MarkerType,
  MiniMap,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";

// ─── Handle IDs (single source of truth) ─────────────────────────────────────
//
//  ActorNode:
//    "a-right"  → source handle on the right   (left actors → UC)
//    "a-left"   → source handle on the left    (right actors → UC)
//    "a-top"    → source handle on top          (inheritance outgoing)
//    "a-bot"    → target handle on bottom       (inheritance incoming)
//
//  UseCaseNode:
//    "u-left"   → target handle on the left    (edges arriving from left actors)
//    "u-right"  → target handle on the right   (edges arriving from right actors)
//    "u-src-r"  → source handle on the right   (UC → UC, outgoing)
//    "u-src-l"  → source handle on the left    (UC → UC, outgoing)
//    "u-tgt-t"  → target handle on top         (UC → UC, incoming vertical)

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTOR_ICONS: Record<string, React.ElementType> = {
  Guest: IconUser,
  Buyer: IconShoppingCart,
  Seller: IconBriefcase,
  JobOwner: IconBuilding,
  "Job Owner": IconBuilding,
  Applicant: IconMail,
  Admin: IconShield,
  Moderator: IconEye,
};

const CATEGORY_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  General: {
    bg: "hsl(220 80% 60% / 0.12)",
    border: "hsl(220 80% 60% / 0.55)",
    text: "hsl(220 80% 72%)",
  },
  "Gig / Seller": {
    bg: "hsl(262 80% 60% / 0.12)",
    border: "hsl(262 80% 60% / 0.55)",
    text: "hsl(262 80% 72%)",
  },
  Job: {
    bg: "hsl(160 70% 45% / 0.12)",
    border: "hsl(160 70% 45% / 0.55)",
    text: "hsl(160 70% 60%)",
  },
  "Order Lifecycle": {
    bg: "hsl(35 90% 55% / 0.12)",
    border: "hsl(35 90% 55% / 0.55)",
    text: "hsl(35 90% 68%)",
  },
  Payments: {
    bg: "hsl(140 70% 45% / 0.12)",
    border: "hsl(140 70% 45% / 0.55)",
    text: "hsl(140 70% 60%)",
  },
  Reviews: {
    bg: "hsl(10 80% 55% / 0.12)",
    border: "hsl(10 80% 55% / 0.55)",
    text: "hsl(10 80% 68%)",
  },
  "Admin / Moderation": {
    bg: "hsl(0 70% 55% / 0.12)",
    border: "hsl(0 70% 55% / 0.55)",
    text: "hsl(0 70% 68%)",
  },
};

const ACTOR_W = 190;
const ACTOR_H = 72;
const UC_W = 185;
const UC_H = 46;
const H_GAP = 80; // horizontal gap between columns
const UC_ROW_GAP = 14;
const CAT_GAP = 36; // extra vertical gap between categories

// ─── Layout ──────────────────────────────────────────────────────────────────

function buildLayout(
  actors: UCActor[],
  useCases: UCUseCase[],
  relations: UCRelation[],
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const leftActors = actors.filter((a) => a.side === "left");
  const rightActors = actors.filter((a) => a.side === "right");
  const categories = Array.from(new Set(useCases.map((u) => u.category)));

  // Column X positions
  const leftX = 0;
  const col1X = ACTOR_W + H_GAP;
  const col2X = col1X + UC_W + 48;
  const rightX = col2X + UC_W + H_GAP;

  // ── Left actors ──
  {
    let y = 60;
    leftActors.forEach((actor) => {
      nodes.push({
        id: actor.id,
        type: "actorNode",
        position: { x: leftX, y },
        data: { actor },
        draggable: true,
      });
      y += ACTOR_H + 28;
    });
  }

  // ── Right actors ──
  {
    let y = 60;
    rightActors.forEach((actor) => {
      nodes.push({
        id: actor.id,
        type: "actorNode",
        position: { x: rightX, y },
        data: { actor },
        draggable: true,
      });
      y += ACTOR_H + 28;
    });
  }

  // ── Use cases: 2 center columns, grouped by category ──
  {
    let y = 30;
    categories.forEach((cat) => {
      const catUcs = useCases.filter((u) => u.category === cat);
      const col1ucs = catUcs.filter((_, i) => i % 2 === 0);
      const col2ucs = catUcs.filter((_, i) => i % 2 === 1);
      const rows = Math.max(col1ucs.length, col2ucs.length);

      col1ucs.forEach((uc, i) => {
        nodes.push({
          id: uc.id,
          type: "useCaseNode",
          position: { x: col1X, y: y + i * (UC_H + UC_ROW_GAP) },
          data: { useCase: uc },
          draggable: true,
        });
      });
      col2ucs.forEach((uc, i) => {
        nodes.push({
          id: uc.id,
          type: "useCaseNode",
          position: { x: col2X, y: y + i * (UC_H + UC_ROW_GAP) },
          data: { useCase: uc },
          draggable: true,
        });
      });

      y += rows * (UC_H + UC_ROW_GAP) + CAT_GAP;
    });
  }

  // ── Edges ──
  relations.forEach((rel) => {
    const srcActor = actors.find((a) => a.id === rel.source);
    const tgtActor = actors.find((a) => a.id === rel.target);
    const isActorSrc = !!srcActor;
    const isActorTgt = !!tgtActor;

    let sourceHandle: string | undefined;
    let targetHandle: string | undefined;

    if (rel.type === "inheritance") {
      // actor → actor (source child → parent)
      sourceHandle = "a-top";
      targetHandle = "a-bot";
    } else if (isActorSrc && !isActorTgt) {
      // actor → usecase
      sourceHandle = srcActor!.side === "left" ? "a-right" : "a-left";
      targetHandle = srcActor!.side === "left" ? "u-left" : "u-right";
    } else if (!isActorSrc && isActorTgt) {
      // reversed: usecase → actor (uncommon but handle gracefully)
      sourceHandle = "u-src-r";
      targetHandle = tgtActor!.side === "left" ? "a-right" : "a-left";
    } else {
      // usecase → usecase (include / extend)
      sourceHandle = "u-src-r";
      targetHandle = "u-left";
    }

    // Edge visual style
    const baseEdge = {
      id: rel.id,
      source: rel.source,
      target: rel.target,
      sourceHandle,
      targetHandle,
      type: "ucEdge",
    };

    if (rel.type === "association") {
      edges.push({
        ...baseEdge,
        data: { label: "" },
        style: { stroke: "hsl(215 70% 62%)", strokeWidth: 1.6 },
        markerEnd: {
          type: MarkerType.Arrow,
          color: "hsl(215 70% 62%)",
          width: 16,
          height: 16,
        },
      } as Edge);
    } else if (rel.type === "include") {
      edges.push({
        ...baseEdge,
        data: { label: "<<include>>" },
        style: {
          stroke: "hsl(262 70% 68%)",
          strokeWidth: 1.4,
          strokeDasharray: "5 4",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "hsl(262 70% 68%)",
          width: 12,
          height: 12,
        },
      } as Edge);
    } else if (rel.type === "extend") {
      edges.push({
        ...baseEdge,
        data: { label: "<<extend>>" },
        style: {
          stroke: "hsl(35 90% 62%)",
          strokeWidth: 1.4,
          strokeDasharray: "5 4",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "hsl(35 90% 62%)",
          width: 12,
          height: 12,
        },
      } as Edge);
    } else if (rel.type === "inheritance") {
      edges.push({
        ...baseEdge,
        data: { label: "" },
        style: {
          stroke: "hsl(160 65% 52%)",
          strokeWidth: 1.4,
          strokeDasharray: "4 3",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "hsl(160 65% 52%)",
          width: 12,
          height: 12,
        },
      } as Edge);
    }
  });

  return { nodes, edges };
}

// ─── Custom Nodes ─────────────────────────────────────────────────────────────

const handleCls = "!w-2 !h-2 !min-w-0 !border !rounded-full";
const actorHandleCls = `${handleCls} !bg-primary/50 !border-primary/60`;
const ucHandleCls = `${handleCls} !bg-transparent !border-transparent !w-1 !h-1`;

function ActorNode({ data, selected }: NodeProps) {
  const actor = (data as { actor: UCActor }).actor;
  const IconComp =
    ACTOR_ICONS[actor.label] || ACTOR_ICONS[actor.id] || IconUser;
  const isRight = actor.side === "right";

  return (
    <div
      className={[
        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200 shadow-md cursor-grab active:cursor-grabbing select-none",
        isRight ? "flex-row-reverse text-right" : "",
        selected
          ? "border-primary bg-primary/15 ring-2 ring-primary/30 shadow-lg shadow-primary/15"
          : "border-border/60 bg-card/90 hover:border-primary/50 hover:shadow-md",
      ].join(" ")}
      style={{ minWidth: 160, backdropFilter: "blur(8px)" }}
    >
      {/* Source: right (left actors connect to UCs on their right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="a-right"
        className={actorHandleCls}
      />
      {/* Source: left (right actors connect to UCs on their left) */}
      <Handle
        type="source"
        position={Position.Left}
        id="a-left"
        className={actorHandleCls}
      />
      {/* Inheritance: outgoing (child actor) */}
      <Handle
        type="source"
        position={Position.Top}
        id="a-top"
        className={actorHandleCls}
        style={{ opacity: 0.4 }}
      />
      {/* Inheritance: incoming (parent actor) */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="a-bot"
        className={actorHandleCls}
        style={{ opacity: 0.4 }}
      />

      <div
        className={`p-2 rounded-lg shrink-0 transition-colors ${selected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
      >
        <IconComp className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-foreground truncate leading-tight">
          {actor.label}
        </div>
        {actor.parentId && (
          <div className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
            <IconHierarchy className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">extends {actor.parentId}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function UseCaseNode({ data, selected }: NodeProps) {
  const useCase = (data as { useCase: UCUseCase }).useCase;
  const colors =
    CATEGORY_COLORS[useCase.category] ?? CATEGORY_COLORS["General"];

  return (
    <div
      className="flex items-center justify-center px-4 py-2.5 rounded-full border text-center transition-all duration-200 shadow-sm cursor-grab active:cursor-grabbing select-none"
      style={{
        minWidth: 160,
        background: selected ? colors.border : colors.bg,
        borderColor: colors.border,
        backdropFilter: "blur(6px)",
        boxShadow: selected
          ? `0 0 0 2.5px ${colors.border}, 0 4px 20px ${colors.bg}`
          : undefined,
      }}
    >
      {/* Target: edges arriving from LEFT (left actors) */}
      <Handle
        type="target"
        position={Position.Left}
        id="u-left"
        className={ucHandleCls}
      />
      {/* Target: edges arriving from RIGHT (right actors) */}
      <Handle
        type="target"
        position={Position.Right}
        id="u-right"
        className={ucHandleCls}
      />
      {/* Target: arriving from top (UC→UC vertical) */}
      <Handle
        type="target"
        position={Position.Top}
        id="u-tgt-t"
        className={ucHandleCls}
      />
      {/* Source: outgoing to right (UC→UC) */}
      <Handle
        type="source"
        position={Position.Right}
        id="u-src-r"
        className={ucHandleCls}
      />
      {/* Source: outgoing to left (UC→UC reversed) */}
      <Handle
        type="source"
        position={Position.Left}
        id="u-src-l"
        className={ucHandleCls}
      />
      {/* Source: outgoing downward */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="u-src-b"
        className={ucHandleCls}
      />

      <span
        className="text-[10px] font-semibold leading-tight"
        style={{ color: selected ? "#fff" : colors.text }}
      >
        {useCase.label}
      </span>
    </div>
  );
}

// ─── Custom Edge ─────────────────────────────────────────────────────────────

function UCEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const label = (data as any)?.label as string | undefined;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={
          selected
            ? {
                ...style,
                strokeWidth: ((style?.strokeWidth as number) || 1.5) + 1,
                filter: "brightness(1.25)",
              }
            : style
        }
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "none",
              fontSize: 9,
              fontFamily: "monospace",
              padding: "1px 5px",
              borderRadius: 4,
              background: "var(--background, #0a0a0a)",
              border: `1px solid ${(style as any)?.stroke ?? "#888"}`,
              color: (style as any)?.stroke ?? "#888",
              opacity: 0.92,
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const nodeTypes = { actorNode: ActorNode, useCaseNode: UseCaseNode };
const edgeTypes = { ucEdge: UCEdge };

// ─── Legend ──────────────────────────────────────────────────────────────────

function Legend() {
  const items = [
    { color: "hsl(215 70% 62%)", dash: false, label: "Association" },
    { color: "hsl(262 70% 68%)", dash: true, label: "<<include>>" },
    { color: "hsl(35 90% 62%)", dash: true, label: "<<extend>>" },
    { color: "hsl(160 65% 52%)", dash: true, label: "Inheritance" },
  ];
  return (
    <div className="absolute bottom-16 left-3 z-20 bg-card/95 border border-border/60 rounded-xl px-3 py-2.5 shadow-lg backdrop-blur-sm space-y-1.5 pointer-events-none">
      <div className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-1.5">
        Legend
      </div>
      {items.map(({ color, dash, label }) => (
        <div key={label} className="flex items-center gap-2">
          <svg width={30} height={10} style={{ overflow: "visible" }}>
            <defs>
              <marker
                id={`lg-${label}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={color} />
              </marker>
            </defs>
            <line
              x1={0}
              y1={5}
              x2={26}
              y2={5}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray={dash ? "4 3" : undefined}
              markerEnd={`url(#lg-${label})`}
            />
          </svg>
          <span className="text-[9px] font-mono text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Category chips (top-right) ───────────────────────────────────────────────

function CategoryKey() {
  return (
    <div className="absolute top-3 right-16 z-20 flex flex-wrap gap-1.5 max-w-xs pointer-events-none">
      {Object.entries(CATEGORY_COLORS).map(([cat, clr]) => (
        <div
          key={cat}
          className="text-[8px] font-semibold px-2 py-0.5 rounded-full border"
          style={{
            background: clr.bg,
            borderColor: clr.border,
            color: clr.text,
          }}
        >
          {cat}
        </div>
      ))}
    </div>
  );
}

// ─── Inner flow component (must be inside ReactFlowProvider) ──────────────────

interface InnerProps {
  actors: UCActor[];
  useCases: UCUseCase[];
  relations: UCRelation[];
  selectedActorId: string | null;
  onSelectActor: (id: string | null) => void;
}

function FlowInner({
  actors,
  useCases,
  relations,
  selectedActorId,
  onSelectActor,
}: InnerProps) {
  const { fitView } = useReactFlow();

  // ── Stable key to detect data changes ──
  const dataKey = useMemo(
    () => `${actors.length}:${useCases.length}:${relations.length}`,
    [actors, useCases, relations],
  );

  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => buildLayout(actors, useCases, relations),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataKey],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  // Re-layout when data changes
  useEffect(() => {
    const { nodes: n, edges: e } = buildLayout(actors, useCases, relations);
    setNodes(n);
    setEdges(e);
    setTimeout(() => fitView({ padding: 0.12, duration: 500 }), 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  // ── Compute allowed set for actor filter ──
  const allowedIds = useMemo<Set<string> | null>(() => {
    if (!selectedActorId) return null;

    const ancestors = new Set<string>([selectedActorId]);
    let cur = actors.find((a) => a.id === selectedActorId);
    while (cur?.parentId) {
      if (ancestors.has(cur.parentId)) break;
      ancestors.add(cur.parentId);
      cur = actors.find((a) => a.id === cur!.parentId!);
    }

    const allowed = new Set<string>([...ancestors]);
    relations.forEach((rel) => {
      if (rel.type === "association") {
        if (ancestors.has(rel.source)) allowed.add(rel.target);
        if (ancestors.has(rel.target)) allowed.add(rel.source);
      }
    });
    // Transitive include/extend
    let changed = true;
    while (changed) {
      changed = false;
      relations.forEach((rel) => {
        if (rel.type === "include" || rel.type === "extend") {
          if (allowed.has(rel.source) && !allowed.has(rel.target)) {
            allowed.add(rel.target);
            changed = true;
          }
          if (allowed.has(rel.target) && !allowed.has(rel.source)) {
            allowed.add(rel.source);
            changed = true;
          }
        }
      });
    }
    return allowed;
  }, [selectedActorId, actors, relations]);

  // Apply opacity based on filter
  const visibleNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        style: {
          ...n.style,
          opacity: allowedIds ? (allowedIds.has(n.id) ? 1 : 0.1) : 1,
          transition: "opacity 0.25s",
        },
        selected: n.id === selectedActorId,
      })),
    [nodes, allowedIds, selectedActorId],
  );

  const visibleEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        style: {
          ...e.style,
          opacity: allowedIds
            ? allowedIds.has(e.source) && allowedIds.has(e.target)
              ? 1
              : 0.04
            : 1,
          transition: "opacity 0.25s",
        },
      })),
    [edges, allowedIds],
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (!actors.some((a) => a.id === node.id)) return;
      onSelectActor(selectedActorId === node.id ? null : node.id);
    },
    [actors, selectedActorId, onSelectActor],
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={() => onSelectActor(null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.08}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: "ucEdge" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="hsl(var(--border))"
          gap={28}
          size={1}
          style={{ opacity: 0.3 }}
        />
        <Controls className="[&>button]:bg-card [&>button]:border-border [&>button]:text-foreground [&>button:hover]:bg-accent" />
        <MiniMap
          nodeColor={(n) => {
            if (actors.some((a) => a.id === n.id)) return "hsl(215 70% 62%)";
            const uc = useCases.find((u) => u.id === n.id);
            return (
              CATEGORY_COLORS[uc?.category ?? ""]?.border ?? "hsl(220 50% 50%)"
            );
          }}
          maskColor="hsl(var(--background) / 0.65)"
          className="bg-card/95! border-border/60! rounded-xl! overflow-hidden"
        />
      </ReactFlow>

      <Legend />
      <CategoryKey />

      {/* Active filter banner */}
      {selectedActorId && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary shadow-lg backdrop-blur-sm pointer-events-auto">
          <IconFilter className="h-3 w-3 shrink-0" />
          <span className="text-[11px] font-medium">
            Showing:{" "}
            <strong>
              {actors.find((a) => a.id === selectedActorId)?.label}
            </strong>
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectActor(null);
            }}
            className="ml-1 text-[10px] underline opacity-70 hover:opacity-100 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Click-actor hint */}
      {!selectedActorId && (
        <div className="absolute top-3 left-3 z-20 text-[9px] text-muted-foreground/60 pointer-events-none">
          Click an actor to filter connections
        </div>
      )}
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export interface UseCaseFlowVisualizerProps {
  actors: UCActor[];
  useCases: UCUseCase[];
  relations: UCRelation[];
}

export function UseCaseFlowVisualizer({
  actors,
  useCases,
  relations,
}: UseCaseFlowVisualizerProps) {
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);

  return (
    <ReactFlowProvider>
      <FlowInner
        actors={actors}
        useCases={useCases}
        relations={relations}
        selectedActorId={selectedActorId}
        onSelectActor={setSelectedActorId}
      />
    </ReactFlowProvider>
  );
}
