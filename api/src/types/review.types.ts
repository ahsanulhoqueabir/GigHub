import { Gig } from './gig.types';
import { Job } from './job.types';
import { Order } from './order.types';
import { Profile } from './profile.types';

export enum ReviewContext {
  ORDER = 'order',
  TUITION = 'tuition',
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  HIDDEN = 'hidden',
}

export interface Review {
  id: string;
  review_context: ReviewContext;
  order: string | Partial<Order> | null;
  tuition_job: string | Partial<Job> | null;
  gig: string | Partial<Gig> | null;
  reviewer: string | Partial<Profile> | null;
  reviewee: string | Partial<Profile> | null;
  rating_overall: number;
  rating_quality: number;
  rating_communication: number;
  rating_delivery: number;
  comment: string | null;
  response: string | null;
  response_at: string | null;
  is_visible: boolean;
  created_at: string;
}
