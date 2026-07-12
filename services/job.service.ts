import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { slugify } from "@/lib/business/service.utils";
import { paginationParams } from "@/lib/pagination";
import { sanitizeBudgetInput } from "@/lib/shared/regex.utils";
import type {
  CreateJobInput,
  UpdateJobInput,
} from "@/lib/validations/job.schema";
import type { Job } from "@/types/db/job.types";
import type {
  ServiceResult,
  ServiceResultWithReferences,
} from "@/types/generic.types";
import type { PaginationOptions } from "@/types/pagination.types";

/**
 * JobService — handles all Job CRUD operations.
 *
 * - Owner ID is extracted from JWT, never from request body.
 * - Slug is auto-generated from title using `slugify()`.
 * - Delete/Update check ownership via RPC functions.
 * - Single-job fetch auto-increments views.
 *
 * ## Status visibility rules
 *
 * | Scenario                           | Statuses returned         |
 * |------------------------------------|---------------------------|
 * | Public list / Public single fetch  | `ACTIVE` only             |
 * | Owner/Admin list (isOwner=true)    | All except `DELETED`      |
 * | Owner/Admin single fetch (details) | All except `DELETED`      |
 *
 * Status visibility is handled inside the `get_job_by_id` RPC:
 *   - Owner caller → all statuses except DELETED
 *   - Public / other caller → only ACTIVE
 */
export class JobService {
  private static collection = "job";

  /**
   * Create a new job (authenticated user).
   * Owner is taken from the JWT profile ID.
   * Slug is auto-generated from the title.
   */
  static async create(
    ownerId: string,
    params: CreateJobInput,
  ): Promise<ServiceResult<Job>> {
    try {
      const supabase = getSupabaseServerClient();
      const slug = slugify(params.title);

      const budget = params.budget
        ? sanitizeBudgetInput(params.budget)
        : params.budget;

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .insert({
          owner: ownerId,
          category: params.category,
          title: params.title,
          slug,
          description: params.description,
          type: params.type,
          budget,
          deadline: params.deadline,
          location: params.location ?? null,
          required_skills: params.required_skills ?? [],
          attachments: params.attachments ?? [],
          tags: params.tags ?? [],
          views: 0,
        })
        .select()
        .single();

      if (sbError) {
        // Handle unique slug violation
        if (sbError.code === "23505" && sbError.message?.includes("slug")) {
          return error(
            "A job with a similar title already exists. Please try a different title.",
          );
        }
        return error(sbError.message);
      }

      return success(data as Job);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get paginated list of jobs.
   *
   * - **Public callers** (default): only `ACTIVE` jobs are returned.
   * - **Owner/Admin callers** (pass `status` explicitly or a negated filter): use
   *   `status` param or call `getByOwner()` with `isOwner` for owner-scoped access.
   *
   * Supports filtering by category, owner, search term, tags, type, and explicit status.
   * Supports sorting by various fields.
   */
  static async list(
    params: PaginationOptions & {
      category?: string;
      owner?: string;
      search?: string;
      tags?: string[];
      type?: string;
      minBudget?: string;
      maxBudget?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      /** Explicit status filter. When omitted, defaults to `ACTIVE` for public access. */
      status?: string;
    },
  ): Promise<ServiceResult<{ items: Job[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const {
        category,
        owner,
        search,
        tags,
        type,
        sortBy = "created_at",
        sortOrder = "desc",
        status,
      } = params;

      // Build query
      let query = supabase.from(this.collection).select(
        `
          *,
          owner:profile!job_owner_fkey (
            id, name, username, avatar, verified, department
          ),
          category:category!job_category_fkey (
            id, name, slug
          )
        `,
        { count: "exact", head: false },
      );

      // Status filter — defaults to ACTIVE for public access
      query = query.eq("status", status ?? "ACTIVE");

      // Optional category filter
      if (category) {
        query = query.eq("category", category);
      }

      // Optional owner filter
      if (owner) {
        query = query.eq("owner", owner);
      }

      // Optional type filter
      if (type) {
        query = query.eq("type", type);
      }

      // Optional search filter (title or description)
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      // Optional tags filter (array containment)
      if (tags && tags.length > 0) {
        query = query.contains("tags", tags);
      }

      // Apply sorting — whitelist allowed sort fields
      const allowedSortFields = [
        "created_at",
        "updated_at",
        "title",
        "views",
        "deadline",
        "budget",
      ];
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
        items: (data as unknown as Job[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a single job by ID.
   *
   * Uses the `get_job_by_id` RPC for a single roundtrip with owner,
   * category — no N+1 queries.
   *
   * Status visibility is handled inside the RPC:
   *   - Caller is the job owner → all statuses except DELETED
   *   - Caller is anonymous or not the owner → only ACTIVE
   *
   * View counter is incremented only for non-owner fetches (handled inside RPC).
   */
  static async getById(
    id: string,
    callerProfileId?: string | null,
  ): Promise<ServiceResult<Job>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "get_job_by_id",
        {
          p_job_id: id,
          p_slug: null,
          p_caller_profile: callerProfileId ?? null,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        data?: Job;
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Job not found");
      }

      return success(result.data!);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a single job by slug.
   *
   * Uses the `get_job_by_id` RPC (supports both ID and slug lookup).
   *
   * Status visibility is handled inside the RPC:
   *   - Caller is the job owner → all statuses except DELETED
   *   - Caller is anonymous or not the owner → only ACTIVE
   */
  static async getBySlug(
    slug: string,
    callerProfileId?: string | null,
  ): Promise<ServiceResult<Job>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "get_job_by_id",
        {
          p_job_id: null,
          p_slug: slug,
          p_caller_profile: callerProfileId ?? null,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        data?: Job;
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Job not found");
      }

      return success(result.data!);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update a job (owner or admin only).
   * Authorization is handled by the RPC function.
   * If title is changed, slug is auto-regenerated.
   */
  static async update(
    id: string,
    callerProfileId: string,
    callerRole: string,
    params: UpdateJobInput,
  ): Promise<ServiceResult<Job>> {
    try {
      const supabase = getSupabaseServerClient();

      // Auto-generate slug if title is being updated
      let slug: string | undefined;
      if (params.title) {
        slug = slugify(params.title);
      }

      const budget = params.budget
        ? sanitizeBudgetInput(params.budget)
        : params.budget;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "update_job_if_owner_or_admin",
        {
          p_job_id: id,
          p_caller_profile_id: callerProfileId,
          p_caller_role: callerRole,
          p_category: params.category ?? null,
          p_title: params.title ?? null,
          p_slug: slug ?? null,
          p_description: params.description ?? null,
          p_type: params.type ?? null,
          p_budget: budget,
          p_deadline: params.deadline ?? null,
          p_location: params.location ?? null,
          p_required_skills: params.required_skills ?? null,
          p_attachments: params.attachments ?? null,
          p_tags: params.tags ?? null,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        job_id?: string;
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Cannot update job");
      }

      // Fetch the updated job
      const { data: updatedJob, error: fetchError } = await supabase
        .from(this.collection)
        .select(
          `
          *,
          owner:profile!job_owner_fkey (
            id, name, username, avatar, verified, department
          ),
          category:category!job_category_fkey (
            id, name, slug
          )
        `,
        )
        .eq("id", id)
        .single();

      if (fetchError) {
        return error(fetchError.message);
      }

      return success(updatedJob as unknown as Job);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Delete a job safely (owner or admin only).
   * Uses the RPC function which checks ownership and active order references.
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
        "delete_job_if_owner_or_admin",
        {
          p_job_id: id,
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
          ...error(result.error ?? "Cannot delete job"),
          references: result.references,
        };
      }

      return success({ deleted_id: result.deleted_id! });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get jobs by owner.
   *
   * - **Public** (default, `isOwner = false`): only `ACTIVE` jobs.
   * - **The owner themselves or an admin** (`isOwner = true`): all statuses except `DELETED`.
   *
   * When `isOwner = true`, the caller MUST be the owner themselves or an admin.
   * This is enforced by the route layer (JWT check).
   */
  static async getByOwner(
    ownerId: string,
    params: PaginationOptions & {
      category?: string;
      search?: string;
      tags?: string[];
      type?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      /** When `true`, the caller is the owner or an admin — shows all non-deleted jobs. */
      isOwner?: boolean;
    },
  ): Promise<ServiceResult<{ items: Job[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const {
        sortBy = "created_at",
        sortOrder = "desc",
        status,
        isOwner = false,
        category,
        search,
        tags,
        type,
      } = params;

      let query = supabase.from(this.collection).select(
        `
          *,
          owner:profile!job_owner_fkey (
            id, name, username, avatar, verified, department
          ),
          category:category!job_category_fkey (
            id, name, slug
          )
        `,
        { count: "exact", head: false },
      );

      // Always filter by owner
      query = query.eq("owner", ownerId);

      // Status filter
      if (status) {
        query = query.eq("status", status);
      } else if (isOwner) {
        query = query.not("status", "eq", "DELETED");
      } else {
        query = query.eq("status", "ACTIVE");
      }

      // Optional category filter
      if (category) {
        query = query.eq("category", category);
      }

      // Optional type filter
      if (type) {
        query = query.eq("type", type);
      }

      // Optional search filter
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      // Optional tags filter
      if (tags && tags.length > 0) {
        query = query.contains("tags", tags);
      }

      // Apply sorting — whitelist allowed sort fields
      const allowedSortFields = [
        "created_at",
        "updated_at",
        "title",
        "views",
        "deadline",
        "budget",
      ];
      const actualSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : "created_at";

      query = query.order(actualSortBy, {
        ascending: sortOrder === "asc",
        nullsFirst: false,
      });

      query = query.range(offset, offset + limit - 1);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as unknown as Job[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
