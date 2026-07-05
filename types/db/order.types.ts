import { SystemFields } from "../generic.types";
import { Profile } from "./profile.types";
import { Gig, GIGPackageTier } from "./gig.types";
import { Job } from "./job.types";
import { JobProposal } from "./job-proposal.types";

export interface OrderCore {
  code: string;
  buyer: string | Partial<Profile>;
  seller: string | Partial<Profile>;
  source: OrderSource;
  total_price: number;
  title: string;
  amount: number;
  deadline?: string;
  gig?: string | Partial<Gig>;
  job?: string | Partial<Job>;
  package?: GIGPackageTier;
  proposal?: string | Partial<JobProposal>;
  description?: string;
  note?: string;
  cancellation_reason?: string;
  cancellation_request_by?: string | Partial<Profile>;
  cancellation_request_at?: string;
}

export type OrderSource = "JOB" | "GIG";

export interface Order extends OrderCore, SystemFields {}

export interface OrderForm extends Omit<
  OrderCore,
  "buyer" | "seller" | "gig" | "job" | "proposal" | "code"
> {
  buyer: string | null;
  seller: string | null;
  gig?: string | null;
  job?: string | null;
  proposal?: string | null;
}
