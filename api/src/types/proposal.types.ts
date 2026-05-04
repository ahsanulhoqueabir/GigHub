export enum ProposalStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export interface Proposal {
  id: string;
  job: string;
  applicant: string;
  cover_letter: string;
  quoted_price?: number;
  estimated_days?: number;
  attachments?: string[];
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}

export interface ProposalDetail extends Proposal {}
