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
  profile: string;
  amount: number;
  method: WithdrawalMethod;
  account_details: Record<string, unknown>;
  status: WithdrawalStatus;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalDetail extends Withdrawal {}
