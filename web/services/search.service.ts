import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface SearchParams {
  collection: "gigs" | "jobs" | "profiles";
  q: string;
  category?: string;
  skills?: string;
  page?: number;
  limit?: number;
}

export class SearchService {
  /**
   * Search across gigs, jobs, or profiles.
   */
  static async search(
    params: SearchParams,
  ): Promise<ServiceResult<{ results: unknown[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { collection, q, category, skills, page = 1, limit = 10 } = params;

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      switch (collection) {
        case "gigs": {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let query = (supabase as any)
            .from("gigs")
            .select(
              "id, title, slug, status, avg_rating, total_reviews, packages, seller:profiles!gigs_seller_fkey(id, name, username, avatar), category:categories!gigs_category_fkey(id, name, slug)",
              { count: "exact" },
            )
            .eq("status", "active")
            .or(`title.ilike.%${q}%,description.ilike.%${q}%`);

          if (category) {
            query = query.eq("category", category);
          }

          if (skills) {
            query = query.contains("tags", skills.split(","));
          }

          query = query
            .order("created_at", { ascending: false })
            .range(from, to);
          const { data, count } = await query;

          // Extract minimum price from packages
          const results = (data || []).map((gig: any) => ({
            ...gig,
            price: gig.packages?.[0]?.price ?? 0,
          }));

          return success({ results, total: count ?? 0 });
        }

        case "jobs": {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let query = (supabase as any)
            .from("jobs")
            .select(
              "id, title, slug, status, budget_min, budget_max, job_type, poster:profiles!jobs_poster_fkey(id, name, username, avatar), category:categories!jobs_category_fkey(id, name, slug)",
              { count: "exact" },
            )
            .eq("status", "open")
            .or(`title.ilike.%${q}%,description.ilike.%${q}%`);

          if (category) {
            query = query.eq("category", category);
          }

          query = query
            .order("created_at", { ascending: false })
            .range(from, to);
          const { data, count } = await query;

          return success({ results: data || [], total: count ?? 0 });
        }

        case "profiles": {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, count } = await (supabase as any)
            .from("profiles")
            .select(
              "id, name, username, email, avatar, bio, skills, avg_rating, total_reviews, availability_status",
              {
                count: "exact",
              },
            )
            .or(`name.ilike.%${q}%,username.ilike.%${q}%,bio.ilike.%${q}%`)
            .order("created_at", { ascending: false })
            .range(from, to);

          return success({ results: data || [], total: count ?? 0 });
        }

        default:
          return error("Invalid collection. Must be gigs, jobs, or profiles");
      }
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
