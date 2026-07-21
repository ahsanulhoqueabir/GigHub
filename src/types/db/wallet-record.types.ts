import { SystemFields } from "../generic.types";
import { Escrow } from "./escrow.types";
import { Order } from "./order.types";
import { Wallet } from "./wallet.types";

export interface WalletRecordCore {
  wallet: string | Partial<Wallet>;
  amount: number;
  type: WalletRecordType;
  description?: string;
  metadata?: Record<string, unknown>;
  note?: string;
  order?: string | Partial<Order>;
  escrow?: string | Partial<Escrow>;
  payment_method: string;

  // Payment gateway tracking
  transaction_id?: string;
  payment_gateway: string;
}

export type WalletRecordType = "CREDIT" | "DEBIT";

export interface WalletRecord extends WalletRecordCore, SystemFields {}

/**
 * Wallet record description constants for consistent usage
 */
export const WALLET_RECORD_DESCRIPTIONS = {
  PAYMENT_HOLD: "Payment held in escrow for order",
  ORDER_COMPLETION: "Payment received for order completion",
  DISPUTE_RELEASE: "Escrow released after dispute resolution",
  DISPUTE_REFUND: "Escrow refunded after dispute resolution",
} as const;

/**
 * Payment gateway constants
 */
export const PAYMENT_GATEWAYS = {
  BALANCE: "BALANCE",
  SSLCOMMERZ: "SSLCOMMERZ",
  ESCROW: "ESCROW",
} as const;

export type PaymentGateway =
  (typeof PAYMENT_GATEWAYS)[keyof typeof PAYMENT_GATEWAYS];
