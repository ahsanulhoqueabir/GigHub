/**
 * Category Validation Schemas (Zod)
 *
 * Shared between frontend (React Hook Form) and backend (API routes).
 */

import { z } from "zod";
import {
  nameField,
  nameFieldOptional,
  slugField,
  slugFieldOptional,
  nullableOptionalString,
  orderingField,
  orderingFieldOptional,
} from "./shared.schema";

// ─── Create Category ───────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: nameField,

  description: nullableOptionalString,

  slug: slugField,

  image: nullableOptionalString,

  parent: nullableOptionalString,

  ordering: orderingField,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// ─── Update Category (all fields optional) ─────────────────────────────────

export const updateCategorySchema = z.object({
  name: nameFieldOptional,

  description: nullableOptionalString,

  slug: slugFieldOptional,

  image: nullableOptionalString,

  parent: nullableOptionalString,

  ordering: orderingFieldOptional,
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
