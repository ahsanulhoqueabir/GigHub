/**
 * Escrow Validation Schemas (Zod)
 *
 * Used in API routes and can be imported for frontend form validation.
 *
 * - `requestDisputeSchema`  — seller requests a dispute on a DELIVERED order
 * - `resolveDisputeSchema`  — admin resolves a dispute (RELEASE or REFUND)
 */

import { z } from "zod";

// ─── Request Dispute ─────────────────────────────────────────────────────────

export const requestDisputeSchema = z
  .object({
    order_id: z.string().uuid("Invalid order ID"),
    reason: z
      .string()
      .trim()
      .min(10, "Dispute reason must be at least 10 characters")
      .max(1000, "Dispute reason must not exceed 1000 characters"),
  })
  .strict();

export type RequestDisputeInput = z.infer<typeof requestDisputeSchema>;

// ─── Resolve Dispute ─────────────────────────────────────────────────────────

export const resolveDisputeSchema = z
  .object({
    order_id: z.string().uuid("Invalid order ID"),
    resolution: z.enum(["RELEASE", "REFUND"]),
    admin_note: z
      .string()
      .trim()
      .max(2000, "Admin note must not exceed 2000 characters")
      .optional(),
  })
  .strict();

export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;

// ─── Escrow Status ────────────────────────────────────────────────────────────

export const ESCROW_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  REVIEW: "REVIEW",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type EscrowStatus = (typeof ESCROW_STATUS)[keyof typeof ESCROW_STATUS];
