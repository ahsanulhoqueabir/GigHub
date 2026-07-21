/**
 * Announcement Validation Schemas (Zod)
 */

import { z } from "zod";
import { requiredString } from "./shared.schema";

// ─── Create Announcement ───────────────────────────────────────────────────

export const createAnnouncementSchema = z.object({
  title: requiredString("Title"),
  content: requiredString("Content"),
  type: z.string().default("info"),
  send_push: z.boolean().default(true),
  is_active: z.boolean().default(true),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

// ─── Update Announcement (all fields optional) ─────────────────────────────

export const updateAnnouncementSchema = z.object({
  title: requiredString("Title").optional(),
  content: requiredString("Content").optional(),
  type: z.string().optional(),
  is_active: z.boolean().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});

export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
