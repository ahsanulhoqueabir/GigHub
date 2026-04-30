export enum ProposalStatus {
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export interface Proposal {
  id: string;
  gig: string;
  proposer: string;
  cover_letter?: string;
  amount?: number;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}

export interface ProposalDetail extends Proposal {}
