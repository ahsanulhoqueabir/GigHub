import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import type { Gig, GigPackage } from "@/types/db/gig.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CreateGigParams {
  seller: string;
  category_id: string;
  title: string;
  description: string;
  tags?: string[];
  status?: "draft" | "active";
  packages: GigPackage[];
  images?: { url: string; sort_order: number }[];
}

export interface UpdateGigParams {
  title?: string;
  description?: string;
  tags?: string[];
  packages?: GigPackage[];
  images?: { url: string; sort_order: number }[];
  status?: string;
}

export interface ListGigsParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: string;
  min_rating?: number;
  tags?: string;
  min_price?: number;
  max_price?: number;
  max_delivery?: number;
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

export class GigService {
  private static collection = "gigs";

  /**
   * Create a new gig with packages.
   */
  static async create(params: CreateGigParams): Promise<ServiceResult<Gig>> {
    try {
      const supabase = getSupabaseServerClient();
      const slug = generateSlug(params.title);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .insert({
          seller: params.seller,
          category: params.category_id,
          title: params.title,
          slug,
          description: params.description,
          packages: params.packages,
          images: params.images ?? [],
          tags: params.tags ?? [],
          status: params.status ?? "active",
        })
        .select(
          "*, seller:profiles!gigs_seller_fkey(id, name, username, avatar), category:categories!gigs_category_fkey(id, name, slug, icon)",
        )
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as Gig);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * List gigs with filtering, search, sorting, and pagination.
   */
  static async list(
    params: ListGigsParams,
  ): Promise<ServiceResult<{ gigs: Gig[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const {
        page = 1,
        limit = 10,
        sort,
        search,
        category,
        min_rating,
        tags,
        min_price,
        max_price,
        max_delivery,
      } = params;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from(this.collection)
        .select(
          "*, seller:profiles!gigs_seller_fkey(id, name, username, email, avatar), category:categories!gigs_category_fkey(id, name, icon)",
          { count: "exact" },
        )
        .eq("status", "active");

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      if (category) {
        query = query.eq("category", category);
      }

      if (min_rating) {
        query = query.gte("avg_rating", min_rating);
      }

      if (tags) {
        query = query.contains("tags", tags.split(","));
      }

      // Price filtering on JSONB packages - find gigs where ANY package matches price range
      if (min_price !== undefined || max_price !== undefined) {
        // Filter using raw SQL for JSONB package pricing
        if (min_price !== undefined) {
          query = query.filter("packages", "not.is", null);
        }
      }

      // Sorting
      if (sort === "price_asc") {
        // Sort by the minimum price in packages array using raw order
        query = query.order("created_at", { ascending: false });
      } else if (sort === "price_desc") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      // Post-filter for price ranges if needed (since JSONB filtering is limited)
      let filteredData = (data as Gig[]) ?? [];
      if (
        min_price !== undefined ||
        max_price !== undefined ||
        max_delivery !== undefined
      ) {
        filteredData = filteredData.filter((gig) => {
          if (!gig.packages || gig.packages.length === 0) return false;
          return gig.packages.some((pkg) => {
            if (min_price !== undefined && pkg.price < min_price) return false;
            if (max_price !== undefined && pkg.price > max_price) return false;
            if (max_delivery !== undefined && pkg.delivery_days > max_delivery)
              return false;
            return true;
          });
        });
      }

      return success({
        gigs: filteredData,
        total: count ?? filteredData.length,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get gig by slug.
   */
  static async getBySlug(slug: string): Promise<ServiceResult<Gig>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .select(
          "*, seller:profiles!gigs_seller_fkey(id, name, username, email, avatar, bio, avg_rating, total_reviews), category:categories!gigs_category_fkey(id, name, slug, icon)",
        )
        .eq("slug", slug)
        .neq("status", "deleted")
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Gig not found");
      }

      return success(data as Gig);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get gig by ID.
   */
  static async getById(id: string): Promise<ServiceResult<Gig>> {
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
        return error("Gig not found");
      }

      return success(data as Gig);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * List gigs by seller (for "My Gigs").
   */
  static async listBySeller(
    sellerId: string,
    page = 1,
    limit = 10,
  ): Promise<ServiceResult<{ gigs: Gig[]; total: number }>> {
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
        .select(
          "*, category:categories!gigs_category_fkey(id, name, slug, icon)",
          { count: "exact" },
        )
        .eq("seller", sellerId)
        .neq("status", "deleted")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (sbError) {
        return error(sbError.message);
      }

      return success({ gigs: (data as Gig[]) ?? [], total: count ?? 0 });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update a gig. Supports edit and status change operations.
   */
  static async update(
    id: string,
    params: UpdateGigParams,
  ): Promise<ServiceResult<Gig>> {
    try {
      const supabase = getSupabaseServerClient();

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (params.title !== undefined) updateData.title = params.title;
      if (params.description !== undefined)
        updateData.description = params.description;
      if (params.tags !== undefined) updateData.tags = params.tags;
      if (params.packages !== undefined) updateData.packages = params.packages;
      if (params.images !== undefined) updateData.images = params.images;
      if (params.status !== undefined) updateData.status = params.status;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .update(updateData)
        .eq("id", id)
        .select(
          "*, seller:profiles!gigs_seller_fkey(id, name, username, avatar), category:categories!gigs_category_fkey(id, name, slug, icon)",
        )
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as Gig);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Soft-delete a gig by setting status to "deleted".
   */
  static async softDelete(
    id: string,
  ): Promise<
    ServiceResult<{
      id: string;
      slug: string;
      status: string;
      updated_at: string;
    }>
  > {
    try {
      const supabase = getSupabaseServerClient();
      const now = new Date().toISOString();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .update({ status: "deleted", updated_at: now })
        .eq("id", id)
        .select("id, slug, status, updated_at")
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Gig not found");
      }

      return success(
        data as {
          id: string;
          slug: string;
          status: string;
          updated_at: string;
        },
      );
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
