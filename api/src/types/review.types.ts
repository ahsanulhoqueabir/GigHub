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
  order: string | null;
  tuition_job: string | null;
  gig: string | null;
  reviewer: string;
  reviewee: string;
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
