/**
 * Payment Validation Schemas (Zod)
 *
 * Used in payment API routes and frontend payment initiation.
 *
 * - `initiatePaymentSchema` — buyer initiates SSLCommerz payment for an order
 */

import { z } from "zod";

// ─── Initiate Payment ─────────────────────────────────────────────────────────

export const initiatePaymentSchema = z
  .object({
    order_id: z.string().uuid("Invalid order ID"),
  })
  .strict();

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;

// ─── Payment Status Constants ─────────────────────────────────────────────────

export const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  HOLDING: "HOLDING",
  RELEASED: "RELEASED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// ─── SSLCommerz IPN Status ────────────────────────────────────────────────────

export const SSL_IPN_STATUS = {
  VALID: "VALID",
  VALIDATED: "VALIDATED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  UNATTEMPTED: "UNATTEMPTED",
  EXPIRED: "EXPIRED",
} as const;

export type SSLIPNStatus = (typeof SSL_IPN_STATUS)[keyof typeof SSL_IPN_STATUS];
