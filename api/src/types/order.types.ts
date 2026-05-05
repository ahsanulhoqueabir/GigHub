export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface Order {
  id: string;
  order_number: string;
  buyer: string;
  seller: string;
  source_type: string;
  gig?: string | null;
  gig_package?: string | null;
  job?: string | null;
  proposal?: string | null;
  title: string;
  description?: string | null;
  amount: number;
  platform_fee: number;
  seller_earnings: number;
  delivery_days: number;
  revision_count: number;
  revisions_used: number;
  status: OrderStatus;
  delivery_deadline?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends Order {}
