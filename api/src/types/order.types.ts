import { Gig } from './gig.types';
import { Job } from './job.types';
import { Profile } from './profile.types';
import { Proposal } from './proposal.types';

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
  buyer: string | Partial<Profile>;
  seller: string | Partial<Profile>;
  source_type: string;
  gig?: string | Partial<Gig> | null;
  gig_package?: string;
  job?: string | Partial<Job> | null;
  proposal?: string | Partial<Proposal> | null;
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

export type OrderDetail = Order;
