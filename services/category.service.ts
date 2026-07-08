import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import { paginationParams } from "@/lib/pagination";
import type { Category, CategoryTree } from "@/types/db/category.types";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/validations/category.schema";
import type { PaginationOptions } from "@/types/pagination.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export class CategoryService {
  private static collection = "category";

  /**
   * Create a new category (admin only).
   */
  static async create(
    params: CreateCategoryInput,
  ): Promise<ServiceResult<Category>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .insert({
          name: params.name,
          description: params.description,
          slug: params.slug,
          image: params.image,
          parent: params.parent,
          ordering: params.ordering,
        })
        .select()
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as Category);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get paginated list of categories (public).
   * Supports optional parent filter and ordering.
   */
  static async list(
    params: PaginationOptions & {
      parent?: string | null;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<ServiceResult<{ items: Category[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const { parent, sortBy = "ordering", sortOrder = "asc" } = params;

      // Build query
      let query = supabase
        .from(this.collection)
        .select("*", { count: "exact", head: false })
        .neq("status", "DELETED");

      // Optional parent filter
      if (parent === null) {
        query = query.is("parent", null);
      } else if (parent !== undefined) {
        query = query.eq("parent", parent);
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
        items: (data as Category[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a single category by ID (public).
   */
  static async getById(id: string): Promise<ServiceResult<Category>> {
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
        return error("Category not found");
      }

      return success(data as Category);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a single category by slug (public).
   */
  static async getBySlug(slug: string): Promise<ServiceResult<Category>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select("*")
        .eq("slug", slug)
        .neq("status", "DELETED")
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Category not found");
      }

      return success(data as Category);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get category tree (hierarchical, public).
   * Returns all active categories organized as a tree.
   */
  static async getTree(): Promise<ServiceResult<CategoryTree[]>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select("*")
        .neq("status", "DELETED")
        .order("ordering", { ascending: true });

      if (sbError) {
        return error(sbError.message);
      }

      const categories = (data ?? []) as Category[];
      const tree = this.buildTree(categories);

      return success(tree);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update a category (admin only).
   */
  static async update(
    id: string,
    params: UpdateCategoryInput,
  ): Promise<ServiceResult<Category>> {
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
        return error("Category not found");
      }

      return success(data as Category);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Delete a category safely (admin only).
   * Uses the RPC function which checks for gig/job references first.
   */
  static async delete(id: string): Promise<
    ServiceResult<{ deleted_id: string }> & {
      references?: { gigs: number; jobs: number };
    }
  > {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "delete_category_if_unused",
        { p_category_id: id },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        deleted_id?: string;
        error?: string;
        references?: { gigs: number; jobs: number };
      };

      if (!result.success) {
        return {
          ...error(result.error ?? "Cannot delete category"),
          references: result.references,
        };
      }

      return success({ deleted_id: result.deleted_id! });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  // ── Private helpers ──────────────────────────────────────────────

  /**
   * Build a tree structure from a flat list of categories.
   */
  private static buildTree(categories: Category[]): CategoryTree[] {
    const map = new Map<string, CategoryTree>();
    const roots: CategoryTree[] = [];

    // First pass: create all nodes
    for (const cat of categories) {
      map.set(cat.id, { ...cat, subCategories: [] });
    }

    // Second pass: link children to parents
    for (const cat of categories) {
      const node = map.get(cat.id)!;
      if (cat.parent && map.has(cat.parent as string)) {
        map.get(cat.parent as string)!.subCategories.push(node);
      } else if (!cat.parent) {
        roots.push(node);
      }
    }

    return roots;
  }
}
