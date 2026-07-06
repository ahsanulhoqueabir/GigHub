import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import { paginationParams } from "@/lib/pagination";
import type { Department } from "@/types/db/department.types";
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "@/lib/validations/department.schema";
import type { PaginationOptions } from "@/types/pagination.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface DepartmentListParams extends PaginationOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string; // optional status filter for admin
}

export class DepartmentService {
  private static collection = "department";

  /**
   * Create a new department (admin only).
   */
  static async create(
    params: CreateDepartmentInput,
  ): Promise<ServiceResult<Department>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .insert({
          name: params.name,
          acronym: params.acronym,
          description: params.description,
          code: params.code,
          image: params.image,
          id_pattern: params.id_pattern,
        })
        .select()
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as Department);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Core list method — reusable for both public and admin.
   *
   * - If `statusFilter` is provided, filters by that status.
   * - If `statusFilter` is omitted, excludes DELETED by default.
   *   (Admin can pass `statusFilter: undefined` + `includeDeleted: true`
   *    to see everything.)
   *
   * @example
   * ```ts
   * // Public — active only
   * DepartmentService.list({ page, limit, statusFilter: "ACTIVE" });
   *
   * // Admin — all non-deleted
   * DepartmentService.list({ page, limit });
   *
   * // Admin — everything including deleted
   * DepartmentService.list({ page, limit, includeDeleted: true });
   *
   * // Admin — specific status
   * DepartmentService.list({ page, limit, statusFilter: "DRAFT" });
   * ```
   */
  static async list(
    params: DepartmentListParams & {
      statusFilter?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ServiceResult<{ items: Department[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const {
        sortBy = "name",
        sortOrder = "asc",
        statusFilter,
        includeDeleted,
      } = params;

      // Build query
      let query = supabase
        .from(this.collection)
        .select("*", { count: "exact", head: false });

      // Status filtering
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      } else if (!includeDeleted) {
        query = query.neq("status", "DELETED");
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as Department[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a single department by ID (public — excludes DELETED).
   */
  static async getById(id: string): Promise<ServiceResult<Department>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select("*")
        .eq("id", id)
        .neq("status", "DELETED")
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Department not found");
      }

      return success(data as Department);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a department by ID for admin — no status filter.
   */
  static async getByIdAdmin(id: string): Promise<ServiceResult<Department>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select("*")
        .eq("id", id)
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Department not found");
      }

      return success(data as Department);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update a department (admin only).
   */
  static async update(
    id: string,
    params: UpdateDepartmentInput,
  ): Promise<ServiceResult<Department>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .update({
          ...params,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .neq("status", "DELETED")
        .select()
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Department not found");
      }

      return success(data as Department);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Soft-delete a department (admin only).
   */
  static async delete(id: string): Promise<ServiceResult<Department>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .update({
          status: "DELETED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .neq("status", "DELETED")
        .select()
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Department not found");
      }

      return success(data as Department);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
