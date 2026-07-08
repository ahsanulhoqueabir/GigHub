import { SystemFields } from "../generic.types";
import { Job } from "./job.types";
import { Profile } from "./profile.types";

// ─── Core ──────────────────────────────────────────────────────────────────

export interface JobProposalCore {
  job: string | Partial<Job>;
  applicant: string | Partial<Profile>;
  description: string;
  attachments: string[];
}

// ─── Entity ────────────────────────────────────────────────────────────────

export interface JobProposal extends JobProposalCore, SystemFields {}

export interface JobProposalForm extends Omit<
  JobProposalCore,
  "job" | "applicant"
> {
  job: string | null;
  applicant: string | null;
}

// ─── UI / View helpers ─────────────────────────────────────────────────────

/** Params for creating a new proposal */
export type CreateJobProposalParams = Pick<
  JobProposalCore,
  "job" | "description" | "attachments"
>;
