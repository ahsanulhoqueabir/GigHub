/**
 * Ad Banner Validation Schemas (Zod)
 */

import { z } from "zod";
import {
  nullableOptionalString,
  requiredString,
  shortString,
} from "./shared.schema";

// ─── Create Ad Banner ──────────────────────────────────────────────────────

export const createAdBannerSchema = z.object({
  name: shortString("Name"),
  placement: requiredString("Placement"),
  image_url: requiredString("Image URL"),
  alt_text: requiredString("Alt text"),
  target_url: nullableOptionalString,
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});

export type CreateAdBannerInput = z.infer<typeof createAdBannerSchema>;

// ─── Update Ad Banner (all fields optional) ────────────────────────────────

export const updateAdBannerSchema = z.object({
  name: shortString("Name").optional(),
  placement: requiredString("Placement").optional(),
  image_url: requiredString("Image URL").optional(),
  alt_text: requiredString("Alt text").optional(),
  target_url: nullableOptionalString,
  sort_order: z.number().int().min(0).default(0).optional(),
  is_active: z.boolean().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});

export type UpdateAdBannerInput = z.infer<typeof updateAdBannerSchema>;
