import type { Order } from "@/types/db/order.types";
import type { Profile } from "@/types/db/profile.types";

export type TransactionType =
  | "payment"
  | "earning"
  | "platform_fee"
  | "withdrawal"
  | "refund";
export type TransactionDirection = "credit" | "debit";
export type TransactionStatus = "pending" | "completed" | "failed";
export type TransactionPaymentMethod = "sslcommerz" | "bkash" | "wallet";

export interface Transaction {
  id: string;
  profile: string | Partial<Profile>;
  order: string | Partial<Order> | null;
  type: TransactionType;
  amount: number;
  direction: TransactionDirection;
  balance_after: number;
  description: string | null;
  payment_method: TransactionPaymentMethod | null;
  payment_reference: string | null;
  status: TransactionStatus;
  created_at: string;
}
