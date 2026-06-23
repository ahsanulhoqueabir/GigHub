export interface OrderRecord {
  id: string;
  status:
    | 'pending'
    | 'accepted'
    | 'in_progress'
    | 'in_review'
    | 'completed'
    | 'cancelled'
    | 'dispute';
  code: string;
  buyer: string;
  seller: string;
  gig?: string;
  job?: string;
  package?: 'basic' | 'standard' | 'premium' | 'custom';
  proposal?: string;
  description?: string;
  note?: string;
  source: 'job' | 'gig';
  total_price: number;
  title: string;
  amount: number;
  deadline?: string;
  cancellation_reason?: string;
  cancellation_request_by?: string;
  cancellation_request_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PopulatedOrderRecord extends Omit<
  OrderRecord,
  'buyer' | 'seller' | 'gig' | 'job'
> {
  buyer: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string | null;
  };
  seller: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string | null;
  };
  gig?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  job?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}
