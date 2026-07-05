import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import { paginationParams } from "@/lib/pagination";
import type { JobProposal } from "@/types/db/job-proposal.types";
import type {
  CreateJobProposalInput,
  UpdateJobProposalInput,
} from "@/lib/validations/job-proposal.schema";
import type { PaginationOptions } from "@/types/pagination.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

type ServiceResultWithReferences<T = any> = ServiceResult<T> & {
  references?: { orders: number };
};

/**
 * JobProposalService — handles all Job Proposal CRUD operations.
 *
 * - `applicant` is extracted from JWT, never from request body.
 * - `job` is provided at creation time and cannot be changed on update.
 * - Update only allows changing `description` and `attachments`.
 * - Delete is a **hard delete** (no soft-delete) — but only if no active
 *   order references the proposal.
 */
export class JobProposalService {
  private static collection = "job_proposal";

  /**
   * Create a new job proposal (authenticated user).
   * Applicant is taken from the JWT profile ID.
   */
  static async create(
    applicantId: string,
    params: CreateJobProposalInput,
  ): Promise<ServiceResult<JobProposal>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .insert({
          job: params.job,
          applicant: applicantId,
          description: params.description,
          attachments: params.attachments ?? [],
        })
        .select()
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as JobProposal);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get paginated list of job proposals for a specific job.
   *
   * Returns proposals with applicant profile data.
   */
  static async list(
    params: PaginationOptions & {
      job?: string;
      applicant?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<ServiceResult<{ items: JobProposal[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const {
        job,
        applicant,
        sortBy = "created_at",
        sortOrder = "desc",
      } = params;

      let query = supabase.from(this.collection).select(
        `
          *,
          job:job!job_proposal_job_fkey (
            id, title, slug, status
          ),
          applicant:profile!job_proposal_applicant_fkey (
            id, name, username, avatar, verified, department
          )
        `,
        { count: "exact", head: false },
      );

      // Optional job filter
      if (job) {
        query = query.eq("job", job);
      }

      // Optional applicant filter
      if (applicant) {
        query = query.eq("applicant", applicant);
      }

      // Apply sorting — whitelist allowed sort fields
      const allowedSortFields = ["created_at", "updated_at"];
      const actualSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : "created_at";

      query = query.order(actualSortBy, {
        ascending: sortOrder === "asc",
        nullsFirst: false,
      });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as unknown as JobProposal[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a single job proposal by ID.
   * Includes job and applicant profile data.
   */
  static async getById(id: string): Promise<ServiceResult<JobProposal>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select(
          `
          *,
          job:job!job_proposal_job_fkey (
            id, title, slug, status, description, budget, type, deadline
          ),
          applicant:profile!job_proposal_applicant_fkey (
            id, name, username, avatar, verified, department, created_at
          )
        `,
        )
        .eq("id", id)
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as unknown as JobProposal);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update a job proposal (applicant or admin only).
   * Only `description` and `attachments` can be updated.
   * `job` and `applicant` are immutable after creation.
   *
   * Authorization is handled by the service layer since the update
   * only touches safe fields. The caller must be the applicant or an admin.
   */
  static async update(
    id: string,
    callerProfileId: string,
    callerRole: string,
    params: UpdateJobProposalInput,
  ): Promise<ServiceResult<JobProposal>> {
    try {
      const supabase = getSupabaseServerClient();

      // Fetch existing proposal to check ownership
      const { data: existing, error: fetchError } = await supabase
        .from(this.collection)
        .select("id, applicant")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        return error("Job proposal not found");
      }

      // Authorization check: must be applicant or admin
      if (existing.applicant !== callerProfileId && callerRole !== "ADMIN") {
        return error("Forbidden: You are not the applicant of this proposal");
      }

      // Build update object — only description and attachments allowed
      const updateData: Record<string, unknown> = {};
      if (params.description !== undefined) {
        updateData.description = params.description;
      }
      if (params.attachments !== undefined) {
        updateData.attachments = params.attachments;
      }

      const { data, error: updateError } = await supabase
        .from(this.collection)
        .update(updateData)
        .eq("id", id)
        .select(
          `
          *,
          job:job!job_proposal_job_fkey (
            id, title, slug, status, description, budget, type, deadline
          ),
          applicant:profile!job_proposal_applicant_fkey (
            id, name, username, avatar, verified, department
          )
        `,
        )
        .single();

      if (updateError) {
        return error(updateError.message);
      }

      return success(data as unknown as JobProposal);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Delete a job proposal safely (applicant or admin only).
   * Uses the RPC function which checks ownership and active order references.
   *
   * This is a **hard delete** — the record is removed from the database,
   * but only if no active order references it.
   */
  static async delete(
    id: string,
    callerProfileId: string,
    callerRole: string,
  ): Promise<ServiceResultWithReferences<{ deleted_id: string }>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "delete_job_proposal_if_owner_or_admin",
        {
          p_proposal_id: id,
          p_caller_profile_id: callerProfileId,
          p_caller_role: callerRole,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        deleted_id?: string;
        error?: string;
        references?: { orders: number };
      };

      if (!result.success) {
        return {
          ...error(result.error ?? "Cannot delete job proposal"),
          references: result.references,
        };
      }

      return success({ deleted_id: result.deleted_id! });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get proposals by applicant.
   * Returns proposals with job details attached.
   */
  static async getByApplicant(
    applicantId: string,
    params: PaginationOptions & {
      job?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<ServiceResult<{ items: JobProposal[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const { job, sortBy = "created_at", sortOrder = "desc" } = params;

      let query = supabase.from(this.collection).select(
        `
          *,
          job:job!job_proposal_job_fkey (
            id, title, slug, status, budget, type, deadline
          ),
          applicant:profile!job_proposal_applicant_fkey (
            id, name, username, avatar, verified, department
          )
        `,
        { count: "exact", head: false },
      );

      // Always filter by applicant
      query = query.eq("applicant", applicantId);

      // Optional job filter
      if (job) {
        query = query.eq("job", job);
      }

      // Apply sorting
      const allowedSortFields = ["created_at", "updated_at"];
      const actualSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : "created_at";

      query = query.order(actualSortBy, {
        ascending: sortOrder === "asc",
        nullsFirst: false,
      });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as unknown as JobProposal[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
