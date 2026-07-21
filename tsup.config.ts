import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/types/index.ts", "src/validations/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
});
