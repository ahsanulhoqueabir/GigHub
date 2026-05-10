import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import type { Job, JobType } from "@/types/db/job.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CreateJobParams {
  poster: string;
  category_id: string;
  title: string;
  description: string;
  job_type: string;
  budget_min?: number;
  budget_max?: number;
  budget_type?: string;
  required_skills?: string[];
  attachments?: string[];
}

export interface UpdateJobParams {
  title?: string;
  description?: string;
  job_type?: string;
  budget_min?: number;
  budget_max?: number;
  budget_type?: string;
  required_skills?: string[];
  attachments?: string[];
  status?: string;
}

export interface ListJobsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  job_type?: string;
  listing_scope?: string;
  status?: string;
}

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 200) +
    "-" +
    Date.now()
  );
}

export class JobService {
  private static collection = "jobs";

  /**
   * Create a new job posting.
   */
  static async create(params: CreateJobParams): Promise<ServiceResult<Job>> {
    try {
      const supabase = getSupabaseServerClient();
      const slug = generateSlug(params.title);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .insert({
          poster: params.poster,
          category: params.category_id,
          title: params.title,
          slug,
          description: params.description,
          job_type: params.job_type,
          budget_type: params.budget_type ?? "fixed",
          budget_min: params.budget_min ?? null,
          budget_max: params.budget_max ?? null,
          required_skills: params.required_skills ?? [],
          attachments: params.attachments ?? [],
          status: "open",
        })
        .select(
          "*, poster:profiles!jobs_poster_fkey(id, name, username), category:categories!jobs_category_fkey(id, name, slug)",
        )
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as Job);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * List jobs with filtering, search, and pagination.
   */
  static async list(
    params: ListJobsParams,
  ): Promise<ServiceResult<{ jobs: Job[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const {
        page = 1,
        limit = 10,
        search,
        category,
        job_type,
        listing_scope,
        status = "open",
      } = params;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from(this.collection)
        .select(
          "*, poster:profiles!jobs_poster_fkey(id, name, username, email, avatar), category:categories!jobs_category_fkey(id, name, slug)",
          { count: "exact" },
        )
        .eq("status", status);

      if (listing_scope === "tuition") {
        query = query.eq("job_type", "tuition");
      } else if (listing_scope === "jobs") {
        query = query.neq("job_type", "tuition");
      }

      if (job_type && !listing_scope) {
        query = query.eq("job_type", job_type);
      }

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      if (category) {
        query = query.eq("category", category);
      }

      query = query.order("created_at", { ascending: false });

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({ jobs: (data as Job[]) ?? [], total: count ?? 0 });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get job by slug.
   */
  static async getBySlug(slug: string): Promise<ServiceResult<Job>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .select(
          "*, poster:profiles!jobs_poster_fkey(id, name, username, email, avatar, bio), category:categories!jobs_category_fkey(id, name, slug)",
        )
        .eq("slug", slug)
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Job not found");
      }

      return success(data as Job);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get job by ID.
   */
  static async getById(id: string): Promise<ServiceResult<Job>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .select("*")
        .eq("id", id)
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Job not found");
      }

      return success(data as Job);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * List jobs by poster (for "My Jobs").
   */
  static async listByPoster(
    posterId: string,
    page = 1,
    limit = 10,
  ): Promise<ServiceResult<{ jobs: Job[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const {
        data,
        error: sbError,
        count,
      } = await (supabase as any)
        .from(this.collection)
        .select("*, category:categories!jobs_category_fkey(id, name, slug)", {
          count: "exact",
        })
        .eq("poster", posterId)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (sbError) {
        return error(sbError.message);
      }

      return success({ jobs: (data as Job[]) ?? [], total: count ?? 0 });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update a job.
   */
  static async update(
    id: string,
    params: UpdateJobParams,
  ): Promise<ServiceResult<Job>> {
    try {
      const supabase = getSupabaseServerClient();

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (params.title !== undefined) updateData.title = params.title;
      if (params.description !== undefined)
        updateData.description = params.description;
      if (params.job_type !== undefined) updateData.job_type = params.job_type;
      if (params.budget_min !== undefined)
        updateData.budget_min = params.budget_min;
      if (params.budget_max !== undefined)
        updateData.budget_max = params.budget_max;
      if (params.budget_type !== undefined)
        updateData.budget_type = params.budget_type;
      if (params.required_skills !== undefined)
        updateData.required_skills = params.required_skills;
      if (params.attachments !== undefined)
        updateData.attachments = params.attachments;
      if (params.status !== undefined) updateData.status = params.status;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .update(updateData)
        .eq("id", id)
        .select(
          "*, poster:profiles!jobs_poster_fkey(id, name, username), category:categories!jobs_category_fkey(id, name, slug)",
        )
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as Job);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Cancel (soft-delete) a job by setting status to "cancelled".
   */
  static async cancel(
    id: string,
  ): Promise<ServiceResult<{ id: string; slug: string; status: string }>> {
    try {
      const supabase = getSupabaseServerClient();
      const now = new Date().toISOString();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .update({ status: "cancelled", updated_at: now })
        .eq("id", id)
        .select("id, slug, status")
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Job not found");
      }

      return success(data as { id: string; slug: string; status: string });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
