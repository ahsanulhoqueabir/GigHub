import { JobRecord } from './job.types';

export interface JobProposalRecord {
  id: string;
  status: 'draft' | 'active' | 'expired' | 'hired' | 'rejected';
  job: string;
  applicant: string;
  description: string;
  attachments: any;
  created_at: string;
  updated_at: string;
}

export interface PopulatedJobProposalRecord extends Omit<
  JobProposalRecord,
  'job' | 'applicant'
> {
  job: JobRecord;
  applicant: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string | null;
  };
}
