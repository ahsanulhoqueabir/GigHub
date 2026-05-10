import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import type { Proposal } from "@/types/db/proposal.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CreateProposalParams {
  job_id: string;
  applicant: string;
  cover_letter: string;
  quoted_price: number;
  estimated_days: number;
}

export interface UpdateProposalParams {
  cover_letter?: string;
  quoted_price?: number;
  estimated_days?: number;
  status?: string;
}

export class ProposalService {
  private static collection = "proposals";

  /**
   * Submit a new proposal for a job.
   */
  static async create(
    params: CreateProposalParams,
  ): Promise<ServiceResult<Proposal>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .insert({
          job: params.job_id,
          applicant: params.applicant,
          cover_letter: params.cover_letter,
          quoted_price: params.quoted_price,
          estimated_days: params.estimated_days,
          attachments: [],
          status: "pending",
        })
        .select(
          "*, job:jobs!proposals_job_fkey(id, title, slug), applicant:profiles!proposals_applicant_fkey(id, name, username)",
        )
        .single();

      if (sbError) {
        if (sbError.code === "23505") {
          return error("You have already submitted a proposal for this job");
        }
        return error(sbError.message);
      }

      return success(data as Proposal);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get proposal by ID.
   */
  static async getById(id: string): Promise<ServiceResult<Proposal>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .select(
          "*, job:jobs!proposals_job_fkey(id, title, slug, description), applicant:profiles!proposals_applicant_fkey(id, name, username, email, avatar)",
        )
        .eq("id", id)
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Proposal not found");
      }

      return success(data as Proposal);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * List proposals for a specific job.
   */
  static async listByJob(jobId: string): Promise<ServiceResult<Proposal[]>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .select(
          "*, job:jobs!proposals_job_fkey(id, title, slug), applicant:profiles!proposals_applicant_fkey(id, name, username, email, avatar)",
        )
        .eq("job", jobId)
        .order("created_at", { ascending: false });

      if (sbError) {
        return error(sbError.message);
      }

      return success((data as Proposal[]) ?? []);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * List proposals by applicant (for "My Proposals").
   */
  static async listByApplicant(
    applicantId: string,
  ): Promise<ServiceResult<Proposal[]>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .select(
          "*, job:jobs!proposals_job_fkey(id, title, slug, status, budget_min, budget_max), applicant:profiles!proposals_applicant_fkey(id, name, username)",
        )
        .eq("applicant", applicantId)
        .order("created_at", { ascending: false });

      if (sbError) {
        return error(sbError.message);
      }

      return success((data as Proposal[]) ?? []);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update a proposal.
   */
  static async update(
    id: string,
    params: UpdateProposalParams,
  ): Promise<ServiceResult<Proposal>> {
    try {
      const supabase = getSupabaseServerClient();

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (params.cover_letter !== undefined)
        updateData.cover_letter = params.cover_letter;
      if (params.quoted_price !== undefined)
        updateData.quoted_price = params.quoted_price;
      if (params.estimated_days !== undefined)
        updateData.estimated_days = params.estimated_days;
      if (params.status !== undefined) updateData.status = params.status;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .update(updateData)
        .eq("id", id)
        .select(
          "*, job:jobs!proposals_job_fkey(id, title, slug), applicant:profiles!proposals_applicant_fkey(id, name, username)",
        )
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as Proposal);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Withdraw (soft-delete) a proposal.
   */
  static async withdraw(
    id: string,
  ): Promise<
    ServiceResult<{ id: string; status: string; updated_at: string }>
  > {
    try {
      const supabase = getSupabaseServerClient();
      const now = new Date().toISOString();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .update({ status: "withdrawn", updated_at: now })
        .eq("id", id)
        .select("id, status, updated_at")
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Proposal not found");
      }

      return success(
        data as { id: string; status: string; updated_at: string },
      );
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
