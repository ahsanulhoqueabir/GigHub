import { SystemFields } from "../generic.types";
import { Job } from "./job.types";
import { Profile } from "./profile.types";

export interface JobProposalCore {
  job: string | Partial<Job>;
  applicant: string | Partial<Profile>;
  description: string;
  attachments: string[];
}

export interface JobProposal extends JobProposalCore, SystemFields {}

export interface JobProposalForm extends Omit<
  JobProposalCore,
  "job" | "applicant"
> {
  job: string | null;
  applicant: string | null;
}
