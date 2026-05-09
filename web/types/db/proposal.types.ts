import type { Job } from "@/types/db/job.types";
import type { Profile } from "@/types/db/profile.types";

export type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Proposal {
  id: string;
  job: string | Partial<Job>;
  applicant: string | Partial<Profile>;
  cover_letter: string;
  quoted_price: number | null;
  estimated_days: number | null;
  attachments: string[];
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}
