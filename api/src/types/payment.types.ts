export enum TransactionDirection {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentQueryType {
  TRANSACTIONS = 'transactions',
  BALANCE = 'balance',
  ESCROW = 'escrow',
}

export interface PaymentSessionInput {
  amount: number;
  currency: string;
  tranId: string;
  productName: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
}

export interface PaymentSessionResult {
  tran_id: string;
  gateway_page_url: string;
}

export interface Transaction {
  id: string;
  profile: string;
  order?: string | null;
  tran_id: string;
  direction: TransactionDirection;
  amount: number;
  currency: string;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}

export interface EscrowRecord {
  id: string;
  order: string;
  status: 'held' | 'released' | 'refunded';
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}
