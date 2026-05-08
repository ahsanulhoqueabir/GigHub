export enum EscrowStatus {
  HELD = 'held',
  RELEASED = 'released',
  REFUNDED = 'refunded',
}

export interface Escrow {
  id: string;
  order: string;
  buyer: string;
  seller: string;
  amount: number;
  platform_fee: number;
  status: EscrowStatus;
  auto_release_at?: string | null;
  released_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type EscrowDetail = Escrow;
