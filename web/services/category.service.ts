import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import type { Category } from "@/types/db/category.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export class CategoryService {
  private static collection = "categories";

  /**
   * Fetch all active categories, ordered by sort_order.
   */
  static async list(): Promise<ServiceResult<Category[]>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (sbError) {
        return error(sbError.message);
      }

      return success((data as Category[]) ?? []);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Fetch a single category by ID.
   */
  static async getById(id: string): Promise<ServiceResult<Category>> {
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
        return error("Category not found");
      }

      return success(data as Category);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
