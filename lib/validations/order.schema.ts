/**
 * Order Validation Schemas (Zod)
 *
 * Shared between frontend (React Hook Form) and backend (API routes).
 *
 * - `buyer` / `seller` are extracted from JWT / RPC context, not from the body.
 * - `code` is auto-generated server-side using `generateOrderCode()`.
 * - Gig orders require `gig`, `package`, and optional `deadline`, `description`, `note`.
 * - Job orders require `proposal` and optional `note`.
 */

import { z } from "zod";
import { descriptionField } from "./gig.schema";

// ─── Constants ──────────────────────────────────────────────────────

const GIG_PACKAGE_TIERS = ["BASIC", "STANDARD", "PREMIUM"] as const;

// ─── Create Gig Order ─────────────────────────────────────────────

export const createGigOrderSchema = z
  .object({
    gig: z.string().uuid("Invalid gig ID"),
    package: z.enum(GIG_PACKAGE_TIERS, {
      error: "Package tier must be one of: BASIC, STANDARD, or PREMIUM",
    }),
    deadline: z
      .string()
      .datetime("Deadline must be a valid ISO date")
      .optional(),
    description: descriptionField.optional(),
    note: z
      .string()
      .trim()
      .max(1000, "Note must be at most 1000 characters")
      .optional(),
  })
  .strict();

export type CreateGigOrderInput = z.infer<typeof createGigOrderSchema>;

// ─── Create Job Order ─────────────────────────────────────────────

export const createJobOrderSchema = z
  .object({
    proposal: z.string().uuid("Invalid proposal ID"),
    note: z
      .string()
      .trim()
      .max(1000, "Note must be at most 1000 characters")
      .optional(),
  })
  .strict();

export type CreateJobOrderInput = z.infer<typeof createJobOrderSchema>;

// ─── Cancel Order ─────────────────────────────────────────────────

export const cancelOrderSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(1, "Cancellation reason is required")
      .max(500, "Cancellation reason must be at most 500 characters"),
  })
  .strict();

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
