import { Job } from './job.types';
import { Profile } from './profile.types';

export enum ProposalStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export interface Proposal {
  id: string;
  job: string | Partial<Job>;
  applicant: string | Partial<Profile>;
  cover_letter: string;
  quoted_price?: number;
  estimated_days?: number;
  attachments?: string[];
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}

export type ProposalDetail = Proposal;
