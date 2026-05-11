import { Profile } from './profile.types';

export enum WithdrawalMethod {
  BKASH = 'bkash',
  NAGAD = 'nagad',
  BANK_TRANSFER = 'bank_transfer',
}

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface Withdrawal {
  id: string;
  profile: string | Partial<Profile>;
  amount: number;
  method: WithdrawalMethod;
  account_details: Record<string, unknown>;
  status: WithdrawalStatus;
  admin_note?: string | null;
  processed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type WithdrawalDetail = Withdrawal;
