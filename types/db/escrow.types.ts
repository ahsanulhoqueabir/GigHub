import { SystemFields } from "../generic.types";
import { Order } from "./order.types";
import { Profile } from "./profile.types";

export interface EscrowCore {
  order: string | Partial<Order>;
  sender: string | Partial<Profile>;
  receiver: string | Partial<Profile>;
  amount: number;
  platform_fee: number;
  released_at?: string;
  auto_released_at?: string;
  note?: string;

  // Payment tracking
  payment_status: string;
  payment_method?: string;
  transaction_id?: string;

  // Dispute tracking
  disputed_at?: string;
  resolved_at?: string;
  resolved_by?: string | Partial<Profile>;
  dispute_reason?: string;
  admin_note?: string;
}

export interface Escrow extends EscrowCore, SystemFields {}

/**
 * Escrow payment statuses:
 * - UNPAID   → Created, awaiting payment
 * - HOLDING  → Payment received, funds held
 * - RELEASED → Released to seller
 * - REFUNDED → Refunded to buyer
 */
export type EscrowPaymentStatus =
  | "UNPAID"
  | "HOLDING"
  | "RELEASED"
  | "REFUNDED";
