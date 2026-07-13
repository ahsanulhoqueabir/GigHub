import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { paginationParams } from "@/lib/pagination";
import type {
  CreateJobProposalInput,
  UpdateAppliedJobProposalInput,
  UpdateJobProposalInput,
} from "@/lib/validations/job-proposal.schema";
import type { JobProposal } from "@/types/db/job-proposal.types";
import type {
  ServiceResult,
  ServiceResultWithReferences,
} from "@/types/generic.types";
import type { PaginationOptions } from "@/types/pagination.types";

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

  /**
   * Get paginated list of the caller's own applied jobs.
   *
   * Returns proposals with slim job info (id, title, slug, type, budget, status).
   * Filtered by applicant = callerProfileId.
   */
  static async getAppliedJobs(
    callerProfileId: string,
    params: PaginationOptions & {
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<ServiceResult<{ items: JobProposal[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const { sortBy = "created_at", sortOrder = "desc" } = params;

      let query = supabase.from(this.collection).select(
        `
          id, created_at, updated_at, status, description, attachments,
          job:job!job_proposal_job_fkey (
            id, title
          )
        `,
        { count: "exact", head: false },
      );

      // Always filter by caller's profile
      query = query.eq("applicant", callerProfileId);

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
   * Get a single applied job proposal by ID via RPC.
   *
   * Access is enforced at DB level: returns data only if the caller
   * is the proposal applicant OR the job owner.
   */
  static async getAppliedJobById(
    proposalId: string,
    callerProfileId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<ServiceResult<any>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "get_applied_job_details",
        {
          p_proposal_id: proposalId,
          p_caller_profile: callerProfileId,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        data?: unknown;
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Not found");
      }

      return success(result.data);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update an applied job proposal (applicant or admin only).
   *
   * Rules:
   * - Only the applicant (or ADMIN) can update.
   * - description/attachments editable only when status is DRAFT or PENDING.
   * - status can only be toggled between DRAFT and PENDING.
   */
  static async updateAppliedJob(
    proposalId: string,
    callerProfileId: string,
    callerRole: string,
    params: UpdateAppliedJobProposalInput,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<ServiceResult<any>> {
    try {
      const supabase = getSupabaseServerClient();

      // Fetch existing proposal to check ownership and status
      const { data: existing, error: fetchError } = await supabase
        .from(this.collection)
        .select("id, applicant, status")
        .eq("id", proposalId)
        .single();

      if (fetchError || !existing) {
        return error("Job proposal not found");
      }

      // Authorization: only applicant or ADMIN
      if (existing.applicant !== callerProfileId && callerRole !== "ADMIN") {
        return error("Forbidden: You are not the applicant of this proposal");
      }

      const currentStatus = existing.status as string;

      // Status gate: edits only allowed when DRAFT or PENDING
      if (!["DRAFT", "PENDING"].includes(currentStatus)) {
        return error(
          `Cannot edit proposal with status: ${currentStatus}. Only DRAFT or PENDING proposals can be edited.`,
        );
      }

      // Build sanitized update object (whitelist only)
      const updateData: Record<string, unknown> = {};
      if (params.description !== undefined) {
        updateData.description = params.description;
      }
      if (params.attachments !== undefined) {
        updateData.attachments = params.attachments;
      }
      if (params.status !== undefined) {
        // Double-check: only DRAFT ↔ PENDING toggle allowed
        if (!["DRAFT", "PENDING"].includes(params.status)) {
          return error("Status can only be toggled between DRAFT and PENDING");
        }
        updateData.status = params.status;
      }

      // Perform the update and return updated proposal with full join data
      const { data: updatedData, error: updateError } = await supabase
        .from(this.collection)
        .update(updateData)
        .eq("id", proposalId)
        .select(
          `
          id, created_at, updated_at, status, description, attachments,
          job:job!job_proposal_job_fkey (
            id, title, slug, status, description, budget, type, deadline,
            location, required_skills, attachments, tags
          ),
          applicant:profile!job_proposal_applicant_fkey (
            id, name, username, avatar, verified
          )
        `,
        )
        .single();

      if (updateError) {
        return error(updateError.message);
      }

      return success(updatedData);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get paginated list of proposals for jobs owned by the caller.
   *
   * Uses an `!inner` join on the job relation to filter proposals
   * by `job.owner` directly — no separate job-ID fetch needed.
   * Only returns proposals with PENDING or APPROVED status.
   *
   * Returns raw `{ items, total }` — pagination meta is built by the API layer.
   */
  static async getIncomingProposals(
    callerProfileId: string,
    params: PaginationOptions & {
      job?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<ServiceResult<{ items: JobProposal[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const { sortBy = "created_at", sortOrder = "desc" } = params;

      // Use !inner join on job so that `job.owner` filter works as an
      // INNER JOIN — proposals for jobs not owned by caller are excluded.
      let query = supabase.from(this.collection).select(
        `
          *,
          job:job!job_proposal_job_fkey!inner (
            id, title, slug, status, budget, type, deadline
          ),
          applicant:profile!job_proposal_applicant_fkey (
            id, name, username, avatar, verified, department
          )
        `,
        { count: "exact", head: false },
      );

      // Filter via inner join: only proposals for jobs owned by caller
      query = query.eq("job.owner", callerProfileId);

      // Only return PENDING or APPROVED proposals
      query = query.in("status", ["PENDING", "APPROVED"]);

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

  /**
   * Get a single incoming proposal by ID.
   *
   * Uses the existing RPC which enforces access control at DB level:
   * caller must be proposal applicant OR job owner.
   */
  static async getIncomingProposalById(
    proposalId: string,
    callerProfileId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<ServiceResult<any>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "get_applied_job_details",
        {
          p_proposal_id: proposalId,
          p_caller_profile: callerProfileId,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        data?: unknown;
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Not found");
      }

      return success(result.data);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Approve a PENDING job proposal and atomically create an order.
   *
   * Calls the `approve_job_proposal` RPC which:
   *   1. Validates proposal exists and is PENDING
   *   2. Validates caller is the job owner
   *   3. Updates proposal status to APPROVED
   *   4. Creates order + chat room
   *   5. Returns updated proposal + created order
   *
   * Only the job owner can approve. Admin cannot approve on behalf.
   */
  static async approveProposal(
    proposalId: string,
    callerProfileId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<ServiceResult<any>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "approve_job_proposal",
        {
          p_proposal_id: proposalId,
          p_caller_profile: callerProfileId,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        data?: { proposal: unknown; order: unknown };
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Failed to approve proposal");
      }

      return success(result.data);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
