"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ERRelation,
  ERTable,
  parseMermaid,
  parsePlantUML,
  UCActor,
  UCRelation,
  UCUseCase,
} from "@/lib/schema-parser";
import { IconDatabase, IconTopologyRing3 } from "@tabler/icons-react";
import { useState } from "react";
import { ERDVisualizer } from "./ERDVisualizer";
import { UseCaseFlowVisualizer } from "./UseCaseFlowVisualizer";

interface SchemaVisualizerContainerProps {
  initialErDiagram: string;
  initialUseCaseDiagram: string;
  initialSqlSchema: string;
  /** Pre-parsed JSON from use_cases.json, when provided takes priority over initialUseCaseDiagram */
  initialUseCaseData?: {
    actors: UCActor[];
    useCases: UCUseCase[];
    relations: UCRelation[];
  } | null;
}

/** Parse use-case data from props, preferring pre-parsed JSON over PlantUML. */
function parseUseCaseData(
  data: SchemaVisualizerContainerProps["initialUseCaseData"],
  diagram: string,
): { actors: UCActor[]; useCases: UCUseCase[]; relations: UCRelation[] } {
  if (data) {
    return {
      actors: data.actors,
      useCases: data.useCases,
      relations: data.relations,
    };
  }
  try {
    return parsePlantUML(diagram);
  } catch (e) {
    console.error("Failed to parse initial PlantUML", e);
    return { actors: [], useCases: [], relations: [] };
  }
}

/** Parse ERD from Mermaid text. */
function parseErData(diagram: string): {
  tables: ERTable[];
  relations: ERRelation[];
} {
  try {
    return parseMermaid(diagram);
  } catch (e) {
    console.error("Failed to parse initial Mermaid ERD", e);
    return { tables: [], relations: [] };
  }
}

export function SchemaVisualizerContainer({
  initialErDiagram,
  initialUseCaseDiagram,
  initialUseCaseData,
}: SchemaVisualizerContainerProps) {
  // Parsed states — initialised from props via lazy factories so no effect is needed.
  const [[actors, useCases, relations]] = useState(() => {
    const {
      actors: a,
      useCases: u,
      relations: r,
    } = parseUseCaseData(initialUseCaseData, initialUseCaseDiagram);
    return [a, u, r] as const;
  });

  const [[tables, erRelations], setErState] = useState(() => {
    const { tables: t, relations: r } = parseErData(initialErDiagram);
    return [t, r] as const;
  });

  // Synchronize ERD visual changes back to raw text

  const handleErVisualChange = (
    newTables: ERTable[],
    newRelations: ERRelation[],
  ) => {
    setErState([newTables, newRelations] as const);
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Architecture & Design Visualizer
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Analyze, customize and manage structural database schemas and UML
            use-case mappings for GigHub.
          </p>
        </div>
      </div>

      <Tabs defaultValue="usecase" className="w-full">
        {/* Main Tab Controls */}
        <div className="flex items-center justify-between border-b pb-1.5">
          <TabsList className="bg-transparent border-none p-0 h-10 gap-6">
            <TabsTrigger value="usecase" className="h-9">
              <IconTopologyRing3 className="h-4 w-4 mr-2" />
              Use Case Diagram
            </TabsTrigger>
            <TabsTrigger value="schema" className="h-9">
              <IconDatabase className="h-4 w-4 mr-2" />
              Database ERD Schema
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        <TabsContent
          value="usecase"
          className="pt-4 focus-visible:outline-none"
        >
          <div className="h-[calc(100vh-13rem)] min-h-150 rounded-xl border border-border/60 overflow-hidden">
            <UseCaseFlowVisualizer
              actors={actors}
              useCases={useCases}
              relations={relations}
            />
          </div>
        </TabsContent>

        <TabsContent value="schema" className="pt-4 focus-visible:outline-none">
          <ERDVisualizer
            tables={tables}
            relations={erRelations}
            onChange={handleErVisualChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
