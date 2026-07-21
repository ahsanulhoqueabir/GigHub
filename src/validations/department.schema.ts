/**
 * Department Validation Schemas (Zod)
 *
 * Shared between frontend (React Hook Form) and backend (API routes).
 */

import { z } from "zod";
import {
  nameField,
  nameFieldOptional,
  nullableOptionalString,
} from "./shared.schema";

// ─── Create Department ─────────────────────────────────────────────────────

export const createDepartmentSchema = z.object({
  name: nameField,

  acronym: nullableOptionalString,

  description: nullableOptionalString,

  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters"),

  image: nullableOptionalString,

  id_pattern: nullableOptionalString,
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

// ─── Update Department (all fields optional) ───────────────────────────────

export const updateDepartmentSchema = z.object({
  name: nameFieldOptional,

  acronym: nullableOptionalString,

  description: nullableOptionalString,

  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters")
    .optional(),

  image: nullableOptionalString,

  id_pattern: nullableOptionalString,
});

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
