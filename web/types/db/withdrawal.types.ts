import type { Profile } from "@/types/db/profile.types";

export type WithdrawalMethod = "bkash" | "nagad" | "bank_transfer";
export type WithdrawalStatus =
  | "pending"
  | "processing"
  | "completed"
  | "rejected";

export interface Withdrawal {
  id: string;
  profile: string | Partial<Profile>;
  amount: number;
  method: WithdrawalMethod;
  account_details: Record<string, unknown>;
  status: WithdrawalStatus;
  admin_note: string | null;
  processed_at: string | null;
  created_at: string;
}
