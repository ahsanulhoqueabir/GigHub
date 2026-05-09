import type { Gig } from "@/types/db/gig.types";
import type { Job } from "@/types/db/job.types";
import type { Order } from "@/types/db/order.types";
import type { Profile } from "@/types/db/profile.types";

export type ReviewContext = "order" | "tuition";

export interface Review {
  id: string;
  review_context: ReviewContext;
  order: string | Partial<Order> | null;
  tuition_job: string | Partial<Job> | null;
  gig: string | Partial<Gig> | null;
  reviewer: string | Partial<Profile>;
  reviewee: string | Partial<Profile>;
  rating_overall: number;
  rating_quality: number | null;
  rating_communication: number | null;
  rating_delivery: number | null;
  comment: string | null;
  response: string | null;
  response_at: string | null;
  is_visible: boolean;
  created_at: string;
}
