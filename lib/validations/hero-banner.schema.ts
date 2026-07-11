/**
 * Hero Banner Validation Schemas (Zod)
 */

import {
  nullableOptionalString,
  requiredString,
} from "@/lib/validations/shared.schema";
import { z } from "zod";

// ─── Create Hero Banner ────────────────────────────────────────────────────

export const createHeroBannerSchema = z.object({
  title: requiredString("Title"),
  subtitle: nullableOptionalString,
  image_url: requiredString("Image URL"),
  alt_text: requiredString("Alt text"),
  button_text: nullableOptionalString,
  button_url: nullableOptionalString,
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});

export type CreateHeroBannerInput = z.infer<typeof createHeroBannerSchema>;

// ─── Update Hero Banner (all fields optional) ──────────────────────────────

export const updateHeroBannerSchema = z.object({
  title: requiredString("Title").optional(),
  subtitle: nullableOptionalString,
  image_url: requiredString("Image URL").optional(),
  alt_text: requiredString("Alt text").optional(),
  button_text: nullableOptionalString,
  button_url: nullableOptionalString,
  sort_order: z.number().int().min(0).default(0).optional(),
  is_active: z.boolean().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});

export type UpdateHeroBannerInput = z.infer<typeof updateHeroBannerSchema>;
