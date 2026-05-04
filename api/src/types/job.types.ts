import type { PaginationQuery } from '@/types/services/common.types';

export enum JobType {
  PAID = 'paid',
  FREE = 'free',
  INTERNSHIP = 'internship',
  VOLUNTEER = 'volunteer',
  TUITION = 'tuition',
}

export enum JobStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export interface Job {
  id: string;
  poster: string;
  category: string;
  title: string;
  slug: string;
  description: string;
  job_type: JobType;
  budget_min?: number;
  budget_max?: number;
  required_skills: string[];
  attachments?: string[];
  status: JobStatus;
  total_proposals: number;
  created_at: string;
  updated_at: string;
}

export interface JobDetail extends Job {}

export interface JobQuery extends PaginationQuery {
  category?: string;
  job_type?: JobType;
  budget_min?: number;
  budget_max?: number;
  required_skills?: string;
  status?: JobStatus;
  listing_scope?: 'jobs' | 'tuition';
}
