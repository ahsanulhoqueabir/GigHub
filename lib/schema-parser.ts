export interface UCActor {
  id: string;
  label: string;
  side: "left" | "right";
  parentId?: string | null;
}

export interface UCUseCase {
  id: string;
  label: string;
  category: string;
}

export interface UCRelation {
  id: string;
  source: string;
  target: string;
  type: "association" | "include" | "extend" | "inheritance";
  label?: string;
}

export function parsePlantUML(puml: string) {
  const actors: UCActor[] = [];
  const useCases: UCUseCase[] = [];
  const relations: UCRelation[] = [];

  const lines = puml.split("\n");

  let currentSide: "left" | "right" = "left";
  let currentCategory = "General";

  for (let line of lines) {
    line = line.trim();
    if (
      !line ||
      line.startsWith("@startuml") ||
      line.startsWith("@enduml") ||
      line.startsWith("left to right direction") ||
      line.startsWith("skinparam")
    )
      continue;

    // Detect side headers
    if (line.includes("LEFT SIDE ACTORS")) {
      currentSide = "left";
      continue;
    }
    if (line.includes("RIGHT SIDE ACTORS")) {
      currentSide = "right";
      continue;
    }

    // Detect usecase categories via comments
    if (line.startsWith("' ----") && line.endsWith("----")) {
      currentCategory = line
        .replace(/'\s*----\s*/, "")
        .replace(/\s*----\s*/, "")
        .trim();
      continue;
    }

    // Actor parsing
    // actor Guest
    // actor "Job Owner" as JobOwner
    const actorMatch = line.match(
      /^actor\s+(?:"([^"]+)"|(\w+))(?:\s+as\s+(\w+))?/,
    );
    if (actorMatch) {
      const rawLabel = actorMatch[1] || actorMatch[2];
      const id = actorMatch[3] || actorMatch[2] || rawLabel;
      actors.push({
        id,
        label: rawLabel,
        side: currentSide,
      });
      continue;
    }

    // UseCase parsing
    // usecase "Register / Login" as UC_Auth
    const ucMatch = line.match(
      /^usecase\s+(?:"([^"]+)"|(\w+))(?:\s+as\s+(\w+))?/,
    );
    if (ucMatch) {
      const rawLabel = ucMatch[1] || ucMatch[2];
      const id = ucMatch[3] || ucMatch[2] || rawLabel;
      useCases.push({
        id,
        label: rawLabel,
        category: currentCategory,
      });
      continue;
    }

    // Inheritance parsing
    // Buyer --|> Guest
    const inheritMatch = line.match(/^(\w+)\s*--\|>\s*(\w+)/);
    if (inheritMatch) {
      const childId = inheritMatch[1];
      const parentId = inheritMatch[2];

      // Update actor inheritance parentId
      const actor = actors.find((a) => a.id === childId);
      if (actor) {
        actor.parentId = parentId;
      }

      relations.push({
        id: `${childId}-inherits-${parentId}`,
        source: childId,
        target: parentId,
        type: "inheritance",
      });
      continue;
    }

    // Relation parsing
    // Guest --> UC_Auth
    // UC_OrderGig .> UC_Payment : <<include>>
    // UC_Chat <. UC_SendAttachment : <<extend>>
    const relMatch = line.match(
      /^(\w+)\s*(-->|\.>\s*|\.\.>\s*|<\.\s*|<\.\.\s*)\s*(\w+)(?:\s*:\s*<<(\w+)>>)?/,
    );
    if (relMatch) {
      const source = relMatch[1];
      const arrow = relMatch[2].trim();
      const target = relMatch[3];
      const stereotype = relMatch[4];

      let relType: "association" | "include" | "extend" = "association";
      let actualSource = source;
      let actualTarget = target;

      if (arrow === "<." || arrow === "<..") {
        // Reversed arrow direction (extend relation, target points to base uc)
        actualSource = target;
        actualTarget = source;
        relType = "extend";
      } else if (arrow === ".>" || arrow === "..>") {
        relType = stereotype === "extend" ? "extend" : "include";
      }

      relations.push({
        id: `${actualSource}-${relType}-${actualTarget}`,
        source: actualSource,
        target: actualTarget,
        type: relType,
        label: stereotype ? `<<${stereotype}>>` : undefined,
      });
      continue;
    }
  }

  return { actors, useCases, relations };
}

export function serializePlantUML(
  actors: UCActor[],
  useCases: UCUseCase[],
  relations: UCRelation[],
): string {
  const lines: string[] = [];
  lines.push("@startuml UseCaseDiagram");
  lines.push("left to right direction");
  lines.push("skinparam packageStyle rectangle");
  lines.push("skinparam usecase {");
  lines.push("  BackgroundColor White");
  lines.push("  BorderColor Black");
  lines.push("}");
  lines.push("");

  // LEFT SIDE ACTORS
  lines.push("' ===== LEFT SIDE ACTORS =====");
  const leftActors = actors.filter((a) => a.side === "left");
  for (const actor of leftActors) {
    if (actor.label.includes(" ") || actor.id !== actor.label) {
      lines.push(`actor "${actor.label}" as ${actor.id}`);
    } else {
      lines.push(`actor ${actor.label}`);
    }
  }
  lines.push("");

  // Actor inheritances
  const inheritances = relations.filter((r) => r.type === "inheritance");
  for (const inh of inheritances) {
    lines.push(`${inh.source} --|> ${inh.target}`);
  }
  lines.push("");

  // SYSTEM CONTAINER
  lines.push('rectangle "Marketplace Platform" {');
  lines.push("");

  // Group use cases by category
  const categories = Array.from(new Set(useCases.map((uc) => uc.category)));
  for (const cat of categories) {
    lines.push(`  ' ---- ${cat} ----`);
    const catUcs = useCases.filter((uc) => uc.category === cat);
    for (const uc of catUcs) {
      if (
        uc.label.includes(" ") ||
        uc.label.includes("/") ||
        uc.id !== uc.label
      ) {
        lines.push(`  usecase "${uc.label}" as ${uc.id}`);
      } else {
        lines.push(`  usecase ${uc.label}`);
      }
    }
    lines.push("");
  }
  lines.push("}");
  lines.push("");

  // RIGHT SIDE ACTORS
  lines.push("' ===== RIGHT SIDE ACTORS =====");
  const rightActors = actors.filter((a) => a.side === "right");
  for (const actor of rightActors) {
    if (actor.label.includes(" ") || actor.id !== actor.label) {
      lines.push(`actor "${actor.label}" as ${actor.id}`);
    } else {
      lines.push(`actor ${actor.label}`);
    }
  }
  lines.push("");

  // ASSOCIATIONS
  lines.push("' ===== ASSOCIATIONS =====");
  const associations = relations.filter((r) => r.type === "association");
  for (const assoc of associations) {
    lines.push(`${assoc.source} --> ${assoc.target}`);
  }
  lines.push("");

  // INCLUDE / EXTEND RELATIONSHIPS
  lines.push("' ===== INCLUDE / EXTEND RELATIONSHIPS =====");
  const includesAndExtends = relations.filter(
    (r) => r.type === "include" || r.type === "extend",
  );
  for (const rel of includesAndExtends) {
    if (rel.type === "include") {
      lines.push(`${rel.source} .> ${rel.target} : <<include>>`);
    } else {
      lines.push(`${rel.target} <. ${rel.source} : <<extend>>`);
    }
  }

  lines.push("");
  lines.push("@enduml");

  return lines.join("\n");
}

export interface ERTableColumn {
  name: string;
  type: string;
  isPK: boolean;
  isFK: boolean;
}

export interface ERTable {
  name: string;
  columns: ERTableColumn[];
}

export interface ERRelation {
  id: string;
  source: string;
  target: string;
  type: string;
  label: string;
}

export function parseMermaid(mmd: string) {
  const tables: ERTable[] = [];
  const relations: ERRelation[] = [];

  const lines = mmd.split("\n");
  let currentTable: ERTable | null = null;

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("erDiagram")) continue;

    // Detect table declaration start: DEPARTMENT {
    const tableStartMatch = line.match(/^(\w+)\s*\{/);
    if (tableStartMatch) {
      const name = tableStartMatch[1];
      currentTable = { name, columns: [] };
      tables.push(currentTable);
      continue;
    }

    // Detect table declaration end
    if (line === "}") {
      currentTable = null;
      continue;
    }

    // Detect columns
    if (currentTable) {
      const colMatch = line.match(/^([\w_]+)\s+([\w_]+)(?:\s+(\w+))?/);
      if (colMatch) {
        const type = colMatch[1];
        const name = colMatch[2];
        const key = colMatch[3];

        currentTable.columns.push({
          name,
          type,
          isPK: key === "PK",
          isFK: key === "FK",
        });
      }
      continue;
    }

    // Detect relationships outside table blocks
    // e.g. CATEGORY ||--o{ CATEGORY : "parent"
    const relMatch = line.match(/^(\w+)\s+([|o{}-]+)\s+(\w+)\s*:\s*"([^"]+)"/);
    if (relMatch) {
      const source = relMatch[1];
      const type = relMatch[2];
      const target = relMatch[3];
      const label = relMatch[4];

      relations.push({
        id: `${source}-${target}-${label}`,
        source,
        target,
        type,
        label,
      });
      continue;
    }
  }

  return { tables, relations };
}

export function serializeMermaid(
  tables: ERTable[],
  relations: ERRelation[],
): string {
  const lines: string[] = [];
  lines.push("erDiagram");
  lines.push("");

  for (const table of tables) {
    lines.push(`    ${table.name} {`);
    for (const col of table.columns) {
      const keyStr = col.isPK ? " PK" : col.isFK ? " FK" : "";
      lines.push(`        ${col.type} ${col.name}${keyStr}`);
    }
    lines.push("    }");
    lines.push("");
  }

  lines.push("    %% relationships");
  for (const rel of relations) {
    lines.push(`    ${rel.source} ${rel.type} ${rel.target} : "${rel.label}"`);
  }

  return lines.join("\n");
}
