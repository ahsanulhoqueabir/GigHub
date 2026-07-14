import fs from "fs/promises";
import path from "path";
import { SchemaVisualizerContainer } from "@/components/admin/visualizer/SchemaVisualizerContainer";
import { UCActor, UCUseCase, UCRelation } from "@/lib/schema-parser";

interface UseCaseJsonData {
  actors: UCActor[];
  useCases: UCUseCase[];
  relations: UCRelation[];
}

export default async function VisualizerPage() {
  const schemaDir = path.join(process.cwd(), "data", "schema");
  const erPath       = path.join(schemaDir, "er_diagram.mmd");
  const useCasePath  = path.join(schemaDir, "use_case_diagram (1).puml");
  const sqlPath      = path.join(schemaDir, "gighub-sql.sql");
  const ucJsonPath   = path.join(schemaDir, "use_cases.json");

  const [erDiagram, useCaseDiagram, sqlSchema, ucJsonRaw] = await Promise.all([
    fs.readFile(erPath,      "utf-8").catch(() => ""),
    fs.readFile(useCasePath, "utf-8").catch(() => ""),
    fs.readFile(sqlPath,     "utf-8").catch(() => ""),
    fs.readFile(ucJsonPath,  "utf-8").catch(() => ""),
  ]);

  let useCaseData: UseCaseJsonData | null = null;
  if (ucJsonRaw) {
    try {
      useCaseData = JSON.parse(ucJsonRaw) as UseCaseJsonData;
    } catch {
      console.warn("Failed to parse use_cases.json, falling back to PlantUML parser");
    }
  }

  return (
    <div className="flex-1 w-full p-1.5">
      <SchemaVisualizerContainer
        initialErDiagram={erDiagram}
        initialUseCaseDiagram={useCaseDiagram}
        initialSqlSchema={sqlSchema}
        initialUseCaseData={useCaseData}
      />
    </div>
  );
}
