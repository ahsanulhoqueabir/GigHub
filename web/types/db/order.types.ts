import type { Gig } from "@/types/db/gig.types";
import type { Job } from "@/types/db/job.types";
import type { Profile } from "@/types/db/profile.types";
import type { Proposal } from "@/types/db/proposal.types";

export type OrderSourceType = "gig" | "job";
export type OrderTier = "basic" | "standard" | "premium";
export type OrderStatus =
  | "pending"
  | "active"
  | "in_progress"
  | "delivered"
  | "revision_requested"
  | "completed"
  | "disputed"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  order_number: string;
  buyer: string | Partial<Profile>;
  seller: string | Partial<Profile>;
  source_type: OrderSourceType;
  gig: string | Partial<Gig> | null;
  tier: OrderTier | null;
  job: string | Partial<Job> | null;
  proposal: string | Partial<Proposal> | null;
  title: string;
  description: string | null;
  amount: number;
  platform_fee: number;
  seller_earnings: number;
  delivery_days: number;
  revision_count: number;
  revisions_used: number;
  status: OrderStatus;
  delivery_deadline: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}
