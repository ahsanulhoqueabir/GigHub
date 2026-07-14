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
import { ERRelation, ERTable, serializeMermaid } from "@/lib/schema-parser";
import {
  IconCopy,
  IconDatabase,
  IconKey,
  IconLink,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ERDVisualizerProps {
  tables: ERTable[];
  relations: ERRelation[];
  onChange: (tables: ERTable[], relations: ERRelation[]) => void;
}

export function ERDVisualizer({
  tables,
  relations,
  onChange,
}: ERDVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<
    Record<string, { x: number; y: number; w: number; h: number }>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [hoveredRelation, setHoveredRelation] = useState<string | null>(null);

  // Customizer form states
  const [activePanel, setActivePanel] = useState<
    "add-table" | "add-col" | "add-relation" | "none"
  >("none");
  const [newTable, setNewTable] = useState({ name: "" });
  const [newCol, setNewCol] = useState({
    tableName: "",
    name: "",
    type: "text",
    isPK: false,
    isFK: false,
  });
  const [newRel, setNewRel] = useState({
    source: "",
    target: "",
    type: "||--o{",
    label: "",
  });

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const newCoords: typeof coords = {};

      tables.forEach((table) => {
        const tblEl = document.getElementById(`erd-table-${table.name}`);
        if (tblEl) {
          const rect = tblEl.getBoundingClientRect();
          newCoords[`table-${table.name}`] = {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            w: rect.width,
            h: rect.height,
          };
        }

        table.columns.forEach((col) => {
          const colEl = document.getElementById(
            `erd-col-${table.name}-${col.name}`,
          );
          if (colEl) {
            const rect = colEl.getBoundingClientRect();
            newCoords[`col-${table.name}-${col.name}`] = {
              x: rect.left - containerRect.left,
              y: rect.top - containerRect.top,
              w: rect.width,
              h: rect.height,
            };
          }
        });
      });

      setCoords(newCoords);
    };

    update();
    window.addEventListener("resize", update);
    const timer1 = setTimeout(update, 150);
    const timer2 = setTimeout(update, 500);

    return () => {
      window.removeEventListener("resize", update);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [tables, relations, searchQuery]);

  // Filtering tables based on query
  const filteredTables = tables.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.columns.some((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  // Highlighting relations
  const isRelationHighlighted = (rel: ERRelation) => {
    if (hoveredRelation === rel.id) return true;
    if (!hoveredTable) return false;
    return rel.source === hoveredTable || rel.target === hoveredTable;
  };

  const isTableHighlighted = (name: string) => {
    if (!hoveredTable) return true;
    if (hoveredTable === name) return true;
    return relations.some(
      (rel) =>
        isRelationHighlighted(rel) &&
        ((rel.source === name && rel.target === hoveredTable) ||
          (rel.target === name && rel.source === hoveredTable)),
    );
  };

  // Mutator actions
  const handleAddTable = () => {
    const name = newTable.name.trim().toUpperCase();
    if (!name) {
      toast.error("Table name is required");
      return;
    }
    if (tables.some((t) => t.name === name)) {
      toast.error("Table already exists");
      return;
    }

    onChange([...tables, { name, columns: [] }], relations);
    setNewTable({ name: "" });
    setActivePanel("none");
    toast.success(`Table ${name} created`);
  };

  const handleAddColumn = () => {
    if (!newCol.tableName) {
      toast.error("Please select a table");
      return;
    }
    const colName = newCol.name.trim().toLowerCase();
    if (!colName) {
      toast.error("Column name is required");
      return;
    }

    const targetTable = tables.find((t) => t.name === newCol.tableName);
    if (!targetTable) return;

    if (targetTable.columns.some((c) => c.name === colName)) {
      toast.error("Column already exists in this table");
      return;
    }

    const updatedTables = tables.map((t) => {
      if (t.name === newCol.tableName) {
        return {
          ...t,
          columns: [
            ...t.columns,
            {
              name: colName,
              type: newCol.type,
              isPK: newCol.isPK,
              isFK: newCol.isFK,
            },
          ],
        };
      }
      return t;
    });

    onChange(updatedTables, relations);
    setNewCol({
      tableName: "",
      name: "",
      type: "text",
      isPK: false,
      isFK: false,
    });
    setActivePanel("none");
    toast.success(`Column ${colName} added to ${newCol.tableName}`);
  };

  const handleAddRelation = () => {
    if (!newRel.source || !newRel.target) {
      toast.error("Source and target tables are required");
      return;
    }
    const label = newRel.label.trim().toLowerCase();
    if (!label) {
      toast.error("Relationship label/FK column name is required");
      return;
    }

    const relId = `${newRel.source}-${newRel.target}-${label}`;
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
        label,
      },
    ];

    onChange(tables, updatedRels);
    setNewRel({ source: "", target: "", type: "||--o{", label: "" });
    setActivePanel("none");
    toast.success("Relationship created");
  };

  const handleDeleteTable = (name: string) => {
    const updatedTables = tables.filter((t) => t.name !== name);
    const updatedRels = relations.filter(
      (r) => r.source !== name && r.target !== name,
    );
    onChange(updatedTables, updatedRels);
    toast.success(`Table ${name} removed`);
  };

  const handleDeleteColumn = (tableName: string, colName: string) => {
    const updatedTables = tables.map((t) => {
      if (t.name === tableName) {
        return {
          ...t,
          columns: t.columns.filter((c) => c.name !== colName),
        };
      }
      return t;
    });
    onChange(updatedTables, relations);
    toast.success(`Column ${colName} removed`);
  };

  const handleDeleteRelation = (id: string) => {
    const updatedRels = relations.filter((r) => r.id !== id);
    onChange(tables, updatedRels);
    toast.success("Relation removed");
  };

  const handleCopyMermaid = () => {
    const mmd = serializeMermaid(tables, relations);
    navigator.clipboard.writeText(mmd);
    toast.success("Mermaid ERD code copied!");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-12rem)] min-h-125">
      {/* Visual Canvas Panel */}
      <div
        className="flex-1 bg-accent/5 rounded-xl border border-border/60 relative overflow-auto p-6"
        ref={containerRef}
      >
        {/* SVG relationships lines layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <defs>
            <marker
              id="crow"
              viewBox="0 0 10 10"
              refX="2"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 2 L 10 5 L 0 8 M 10 2 L 10 8"
                fill="none"
                stroke="var(--color-primary, #3b82f6)"
                strokeWidth="1.5"
              />
            </marker>
            <marker
              id="one"
              viewBox="0 0 10 10"
              refX="2"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 5 2 L 5 8 M 8 2 L 8 8"
                fill="none"
                stroke="var(--color-primary, #3b82f6)"
                strokeWidth="1.5"
              />
            </marker>
          </defs>

          {relations.map((rel) => {
            const sourceCard = coords[`table-${rel.source}`];
            const targetCard = coords[`table-${rel.target}`];

            if (!sourceCard || !targetCard) return null;

            // Precision: try to find matching columns
            // Source is typically PK / Parent, Target is typically FK containing the matching column name
            const sourceColCoords = coords[`col-${rel.source}-id`]; // default to 'id' PK
            const targetColCoords =
              coords[`col-${rel.target}-${rel.label}`] ||
              coords[`col-${rel.target}-${rel.label}_id` || ""];

            let x1 = 0,
              y1 = 0,
              x2 = 0,
              y2 = 0;

            if (sourceColCoords && targetColCoords) {
              // Connect column to column
              if (sourceCard.x + sourceCard.w < targetCard.x) {
                // Source is on the left
                x1 = sourceColCoords.x + sourceColCoords.w;
                y1 = sourceColCoords.y + sourceColCoords.h / 2;
                x2 = targetColCoords.x;
                y2 = targetColCoords.y + targetColCoords.h / 2;
              } else if (targetCard.x + targetCard.w < sourceCard.x) {
                // Source is on the right
                x1 = sourceColCoords.x;
                y1 = sourceColCoords.y + sourceColCoords.h / 2;
                x2 = targetColCoords.x + targetColCoords.w;
                y2 = targetColCoords.y + targetColCoords.h / 2;
              } else {
                // Vertical alignment
                x1 = sourceColCoords.x + sourceColCoords.w / 2;
                y1 =
                  sourceColCoords.y +
                  (sourceCard.y < targetCard.y ? sourceColCoords.h : 0);
                x2 = targetColCoords.x + targetColCoords.w / 2;
                y2 =
                  targetColCoords.y +
                  (sourceCard.y < targetCard.y ? 0 : targetColCoords.h);
              }
            } else {
              // Connect table edges
              if (sourceCard.x + sourceCard.w < targetCard.x) {
                x1 = sourceCard.x + sourceCard.w;
                y1 = sourceCard.y + sourceCard.h / 2;
                x2 = targetCard.x;
                y2 = targetCard.y + targetCard.h / 2;
              } else if (targetCard.x + targetCard.w < sourceCard.x) {
                x1 = sourceCard.x;
                y1 = sourceCard.y + sourceCard.h / 2;
                x2 = targetCard.x + targetCard.w;
                y2 = targetCard.y + targetCard.h / 2;
              } else {
                x1 = sourceCard.x + sourceCard.w / 2;
                y1 =
                  sourceCard.y +
                  (sourceCard.y < targetCard.y ? sourceCard.h : 0);
                x2 = targetCard.x + targetCard.w / 2;
                y2 =
                  targetCard.y +
                  (sourceCard.y < targetCard.y ? 0 : targetCard.h);
              }
            }

            const active = hoveredTable ? isRelationHighlighted(rel) : true;
            const highlighted = hoveredTable && isRelationHighlighted(rel);

            let stroke = "var(--color-border, #e5e7eb)";
            let strokeWidth = 1.25;

            if (hoveredTable) {
              if (highlighted) {
                stroke = "var(--color-primary, #3b82f6)";
                strokeWidth = 2.5;
              } else {
                stroke = "var(--color-border, #e5e7eb)";
                strokeWidth = 0.5;
              }
            }

            const dx = Math.abs(x2 - x1) * 0.45;
            const path = `M ${x1} ${y1} C ${x1 + (x1 < x2 ? dx : -dx)} ${y1}, ${x2 + (x1 < x2 ? -dx : dx)} ${y2}, ${x2} ${y2}`;

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
                  className="transition-all duration-200"
                  style={{ opacity: active ? 1 : 0.15 }}
                />
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={8}
                  className="cursor-pointer pointer-events-auto"
                />
              </g>
            );
          })}
        </svg>

        {/* Labels overlay */}
        {relations.map((rel) => {
          const sourceCard = coords[`table-${rel.source}`];
          const targetCard = coords[`table-${rel.target}`];
          if (!sourceCard || !targetCard) return null;

          const sourceColCoords = coords[`col-${rel.source}-id`];
          const targetColCoords =
            coords[`col-${rel.target}-${rel.label}`] ||
            coords[`col-${rel.target}-${rel.label}_id` || ""];

          let x1 = 0,
            y1 = 0,
            x2 = 0,
            y2 = 0;
          if (sourceColCoords && targetColCoords) {
            if (sourceCard.x + sourceCard.w < targetCard.x) {
              x1 = sourceColCoords.x + sourceColCoords.w;
              y1 = sourceColCoords.y + sourceColCoords.h / 2;
              x2 = targetColCoords.x;
              y2 = targetColCoords.y + targetColCoords.h / 2;
            } else if (targetCard.x + targetCard.w < sourceCard.x) {
              x1 = sourceColCoords.x;
              y1 = sourceColCoords.y + sourceColCoords.h / 2;
              x2 = targetColCoords.x + targetColCoords.w;
              y2 = targetColCoords.y + targetColCoords.h / 2;
            } else {
              x1 = sourceColCoords.x + sourceColCoords.w / 2;
              y1 =
                sourceColCoords.y +
                (sourceCard.y < targetCard.y ? sourceColCoords.h : 0);
              x2 = targetColCoords.x + targetColCoords.w / 2;
              y2 =
                targetColCoords.y +
                (sourceCard.y < targetCard.y ? 0 : targetColCoords.h);
            }
          } else {
            x1 = sourceCard.x + sourceCard.w / 2;
            y1 = sourceCard.y + sourceCard.h / 2;
            x2 = targetCard.x + targetCard.w / 2;
            y2 = targetCard.y + targetCard.h / 2;
          }

          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const isLineActive = hoveredTable ? isRelationHighlighted(rel) : true;

          return (
            <div
              key={`label-erd-${rel.id}`}
              className="absolute pointer-events-none select-none z-30 text-[9px] font-mono px-1 py-0.5 rounded bg-background/95 border border-border shadow-xs text-muted-foreground transition-all duration-200"
              style={{
                left: `${midX}px`,
                top: `${midY}px`,
                transform: "translate(-50%, -50%)",
                opacity: isLineActive ? 0.95 : 0.1,
              }}
            >
              {rel.label}
            </div>
          );
        })}

        {/* Toolbar search & filter */}
        <div className="flex items-center gap-3 bg-card/60 backdrop-blur-xs p-3 rounded-xl border border-border/50 mb-6 relative z-30 shadow-xs shrink-0 max-w-md">
          <IconSearch className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tables, columns..."
            className="border-none bg-transparent shadow-none focus-visible:ring-0 p-0 text-xs h-7"
          />
          {searchQuery && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setSearchQuery("")}
              className="h-6 w-6 p-0 cursor-pointer"
            >
              <IconX className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Grid/Flex lists of tables */}
        <div className="flex flex-wrap gap-6 items-start relative z-10">
          {filteredTables.map((table) => {
            const isLit = isTableHighlighted(table.name);

            return (
              <div
                key={table.name}
                id={`erd-table-${table.name}`}
                onMouseEnter={() => setHoveredTable(table.name)}
                onMouseLeave={() => setHoveredTable(null)}
                className={`w-64 rounded-xl border bg-card/85 backdrop-blur-xs shadow-xs transition-all duration-300 overflow-hidden ${
                  isLit
                    ? "border-border hover:border-primary hover:shadow-md"
                    : "opacity-15 border-transparent"
                }`}
              >
                {/* Header */}
                <div className="bg-muted/30 border-b px-4 py-2.5 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <IconDatabase className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-bold text-xs truncate uppercase tracking-wide text-foreground">
                      {table.name}
                    </span>
                  </div>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => handleDeleteTable(table.name)}
                    className="h-6 w-6 text-destructive hover:bg-destructive/10 cursor-pointer p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Columns */}
                <div className="p-1.5 flex flex-col gap-0.5">
                  {table.columns.length === 0 ? (
                    <div className="text-[10px] text-muted-foreground p-3 text-center italic">
                      No columns. Add one.
                    </div>
                  ) : (
                    table.columns.map((col) => (
                      <div
                        key={col.name}
                        id={`erd-col-${table.name}-${col.name}`}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent/40 group/col text-xs"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {col.isPK && (
                            <IconKey className="h-3 w-3 text-amber-500 shrink-0" />
                          )}
                          {col.isFK && (
                            <IconLink className="h-3 w-3 text-sky-500 shrink-0" />
                          )}
                          <span
                            className={`truncate font-medium ${col.isPK ? "text-foreground font-bold" : "text-muted-foreground"}`}
                          >
                            {col.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-mono text-muted-foreground/60 bg-accent/20 px-1.5 py-0.5 rounded">
                            {col.type}
                          </span>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              handleDeleteColumn(table.name, col.name)
                            }
                            className="h-5 w-5 text-destructive p-0 hidden group-hover/col:flex cursor-pointer"
                          >
                            <IconX className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customize Panel (Sidebar) */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-4 h-full">
        {/* Instructions */}
        <Card className="border-border/60 shadow-xs shrink-0">
          <CardHeader className="py-3 px-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                Schema Editor
              </CardTitle>
              <Button
                size="xs"
                variant="outline"
                onClick={handleCopyMermaid}
                className="h-7 text-[10px] gap-1 cursor-pointer"
              >
                <IconCopy className="h-3.5 w-3.5" />
                Copy Mermaid
              </Button>
            </div>
            <CardDescription className="text-xs mt-1">
              Add tables and fields. Copies and updates are synchronized. Paste
              changes back to `er_diagram.mmd`.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Tab Controls for Panels */}
        <Card className="flex-1 border-border/60 shadow-xs overflow-hidden flex flex-col">
          <CardHeader className="py-3 px-4 border-b">
            <div className="flex items-center gap-1.5">
              <Button
                variant={activePanel === "add-table" ? "default" : "outline"}
                size="sm"
                className="flex-1 h-8 text-[11px] cursor-pointer"
                onClick={() =>
                  setActivePanel(
                    activePanel === "add-table" ? "none" : "add-table",
                  )
                }
              >
                Table
              </Button>
              <Button
                variant={activePanel === "add-col" ? "default" : "outline"}
                size="sm"
                className="flex-1 h-8 text-[11px] cursor-pointer"
                onClick={() =>
                  setActivePanel(activePanel === "add-col" ? "none" : "add-col")
                }
              >
                Column
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
                FK Link
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {/* 1. Add Table Form */}
            {activePanel === "add-table" && (
              <div className="p-4 border-b flex flex-col gap-3.5 shrink-0 bg-accent/5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Create Table
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="tbl-name" className="text-[10px] font-medium">
                    Table Name
                  </Label>
                  <Input
                    id="tbl-name"
                    value={newTable.name}
                    onChange={(e) => setNewTable({ name: e.target.value })}
                    placeholder="e.g. WALLET_RECORD"
                    className="h-8 text-xs uppercase"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleAddTable}
                  className="h-8 text-xs cursor-pointer"
                >
                  <IconPlus className="h-3.5 w-3.5 mr-1" />
                  Add Table
                </Button>
              </div>
            )}

            {/* 2. Add Column Form */}
            {activePanel === "add-col" && (
              <div className="p-4 border-b flex flex-col gap-3.5 shrink-0 bg-accent/5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Add Column Fields
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="col-tbl" className="text-[10px] font-medium">
                    Select Table
                  </Label>
                  <select
                    id="col-tbl"
                    value={newCol.tableName}
                    onChange={(e) =>
                      setNewCol({ ...newCol, tableName: e.target.value })
                    }
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none w-full"
                  >
                    <option value="">-- Choose Table --</option>
                    {tables.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="col-name" className="text-[10px] font-medium">
                    Column Name
                  </Label>
                  <Input
                    id="col-name"
                    value={newCol.name}
                    onChange={(e) =>
                      setNewCol({ ...newCol, name: e.target.value })
                    }
                    placeholder="e.g. user_id"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="col-type"
                      className="text-[10px] font-medium"
                    >
                      Data Type
                    </Label>
                    <Input
                      id="col-type"
                      value={newCol.type}
                      onChange={(e) =>
                        setNewCol({ ...newCol, type: e.target.value })
                      }
                      placeholder="e.g. uuid or text"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex gap-4 items-center pt-5">
                    <label className="flex items-center gap-1 text-[10px] font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCol.isPK}
                        onChange={(e) =>
                          setNewCol({ ...newCol, isPK: e.target.checked })
                        }
                        className="rounded border-input text-primary"
                      />
                      PK
                    </label>
                    <label className="flex items-center gap-1 text-[10px] font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCol.isFK}
                        onChange={(e) =>
                          setNewCol({ ...newCol, isFK: e.target.checked })
                        }
                        className="rounded border-input text-primary"
                      />
                      FK
                    </label>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddColumn}
                  className="h-8 text-xs cursor-pointer"
                >
                  <IconPlus className="h-3.5 w-3.5 mr-1" />
                  Add Column
                </Button>
              </div>
            )}

            {/* 3. Add FK Link Form */}
            {activePanel === "add-relation" && (
              <div className="p-4 border-b flex flex-col gap-3.5 shrink-0 bg-accent/5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Connect Relationship
                </div>
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="rel-src-tbl"
                    className="text-[10px] font-medium"
                  >
                    Source Table (PK / Parent)
                  </Label>
                  <select
                    id="rel-src-tbl"
                    value={newRel.source}
                    onChange={(e) =>
                      setNewRel({ ...newRel, source: e.target.value })
                    }
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none w-full"
                  >
                    <option value="">-- Choose Source Table --</option>
                    {tables.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="rel-tgt-tbl"
                    className="text-[10px] font-medium"
                  >
                    Target Table (FK / Child)
                  </Label>
                  <select
                    id="rel-tgt-tbl"
                    value={newRel.target}
                    onChange={(e) =>
                      setNewRel({ ...newRel, target: e.target.value })
                    }
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none w-full"
                  >
                    <option value="">-- Choose Target Table --</option>
                    {tables.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="rel-card"
                      className="text-[10px] font-medium"
                    >
                      Cardinality
                    </Label>
                    <select
                      id="rel-card"
                      value={newRel.type}
                      onChange={(e) =>
                        setNewRel({ ...newRel, type: e.target.value })
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
                    >
                      <option value="||--o{">{"1-to-Many (||--o{)"}</option>
                      <option value="||--||">{"1-to-1 (||--||)"}</option>
                      <option value="||--|{">
                        {"1-to-Required Many (||--|{)"}
                      </option>
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="rel-label-lbl"
                      className="text-[10px] font-medium"
                    >
                      FK Field (Label)
                    </Label>
                    <Input
                      id="rel-label-lbl"
                      value={newRel.label}
                      onChange={(e) =>
                        setNewRel({ ...newRel, label: e.target.value })
                      }
                      placeholder="e.g. seller"
                      className="h-8 text-xs"
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

            {/* List relations to manage */}
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Defined Relationships ({relations.length})
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {relations.map((rel) => (
                      <div
                        key={rel.id}
                        className="flex justify-between items-center text-xs p-2 rounded-lg border border-border/40 hover:bg-accent/10"
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-semibold text-foreground truncate">
                            {rel.source} → {rel.target}
                          </span>
                          <span className="text-[9px] text-muted-foreground truncate">
                            via field:{" "}
                            <span className="font-mono">{rel.label}</span>
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
                    ))}
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
