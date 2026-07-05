import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import { paginationParams } from "@/lib/pagination";
import { slugify } from "@/lib/business/service.utils";
import type { Gig } from "@/types/db/gig.types";
import type { Review } from "@/types/db/reviews.types";
import type {
  CreateGigInput,
  UpdateGigInput,
} from "@/lib/validations/gig.schema";
import type { PaginationOptions } from "@/types/pagination.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

type ServiceResultWithReferences<T = any> = ServiceResult<T> & {
  references?: { orders: number };
};

/**
 * GigService — handles all Gig CRUD operations.
 *
 * - Seller ID is extracted from JWT, never from request body.
 * - Slug is auto-generated from title using `slugify()`.
 * - Create requires exactly 3 packages with unique tiers (BASIC, STANDARD, PREMIUM).
 * - Delete/Update check ownership via RPC functions.
 * - Single-gig fetch auto-increments views.
 *
 * ## Status visibility rules
 *
 * | Scenario                           | Statuses returned         |
 * |------------------------------------|---------------------------|
 * | Public list / Public single fetch  | `ACTIVE` only             |
 * | Owner/Admin list (isOwner=true)    | All except `DELETED`      |
 * | Owner/Admin single fetch (details) | All except `DELETED`      |
 *
 * Status visibility is handled inside the `get_gig_by_id` RPC:
 *   - Owner caller → all statuses except DELETED
 *   - Public / other caller → only ACTIVE
 */
export class GigService {
  private static collection = "gig";

  /**
   * Create a new gig (authenticated seller).
   * Seller is taken from the JWT profile ID.
   * Slug is auto-generated from the title.
   */
  static async create(
    sellerId: string,
    params: CreateGigInput,
  ): Promise<ServiceResult<Gig>> {
    try {
      const supabase = getSupabaseServerClient();
      const slug = slugify(params.title);

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .insert({
          seller: sellerId,
          category: params.category,
          title: params.title,
          slug,
          description: params.description,
          images: params.images ?? [],
          tags: params.tags ?? [],
          views: 0,
          packages: params.packages,
          faq: params.faq ?? [],
          status: "ACTIVE",
        })
        .select()
        .single();

      if (sbError) {
        // Handle unique slug violation
        if (sbError.code === "23505" && sbError.message?.includes("slug")) {
          return error(
            "A gig with a similar title already exists. Please try a different title.",
          );
        }
        return error(sbError.message);
      }

      return success(data as Gig);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get paginated list of gigs.
   *
   * - **Public callers** (default): only `ACTIVE` gigs are returned.
   * - **Owner/Admin callers** (pass `status` explicitly or a negated filter): use
   *   `status` param or call `getBySeller()` with `isOwner` for seller-scoped access.
   *
   * Supports filtering by category, seller, search term, tags, and explicit status.
   * Supports sorting by various fields.
   */
  static async list(
    params: PaginationOptions & {
      category?: string;
      seller?: string;
      search?: string;
      tags?: string[];
      minPrice?: number;
      maxPrice?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      /** Explicit status filter. When omitted, defaults to `ACTIVE` for public access. */
      status?: string;
    },
  ): Promise<ServiceResult<{ items: Gig[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const {
        category,
        seller,
        search,
        tags,
        sortBy = "created_at",
        sortOrder = "desc",
        status,
      } = params;

      // Build query
      let query = supabase.from(this.collection).select(
        `
          *,
          seller:profile!gig_seller_fkey (
            id, name, username, avatar, verified, department
          ),
          category:category!gig_category_fkey (
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

      // Optional seller filter
      if (seller) {
        query = query.eq("seller", seller);
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
        "price",
      ];
      const actualSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : "created_at";

      if (actualSortBy === "price") {
        // Sort by the first package's price in the JSONB array
        query = query.order("packages->0->>price", {
          ascending: sortOrder === "asc",
          nullsFirst: false,
        });
      } else {
        query = query.order(actualSortBy, {
          ascending: sortOrder === "asc",
          nullsFirst: false,
        });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as unknown as Gig[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a single gig by ID.
   *
   * Uses the `get_gig_by_id` RPC for a single roundtrip with seller,
   * category, and reviews — no N+1 queries.
   *
   * Status visibility is handled inside the RPC:
   *   - Caller is the gig owner → all statuses except DELETED
   *   - Caller is anonymous or not the owner → only ACTIVE
   *
   * View counter is incremented only for non-owner fetches (handled inside RPC).
   */
  static async getById(
    id: string,
    callerProfileId?: string | null,
  ): Promise<ServiceResult<Gig & { reviews?: Review[] }>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "get_gig_by_id",
        {
          p_gig_id: id,
          p_slug: null,
          p_caller_profile: callerProfileId ?? null,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        data?: Gig & { reviews?: Review[] };
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Gig not found");
      }

      return success(result.data!);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a single gig by slug.
   *
   * Uses the `get_gig_by_id` RPC (supports both ID and slug lookup).
   *
   * Status visibility is handled inside the RPC:
   *   - Caller is the gig owner → all statuses except DELETED
   *   - Caller is anonymous or not the owner → only ACTIVE
   */
  static async getBySlug(
    slug: string,
    callerProfileId?: string | null,
  ): Promise<ServiceResult<Gig & { reviews?: Review[] }>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "get_gig_by_id",
        {
          p_gig_id: null,
          p_slug: slug,
          p_caller_profile: callerProfileId ?? null,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        data?: Gig & { reviews?: Review[] };
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Gig not found");
      }

      return success(result.data!);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update a gig (seller or admin only).
   * Authorization is handled by the RPC function.
   * If title is changed, slug is auto-regenerated.
   */
  static async update(
    id: string,
    callerProfileId: string,
    callerRole: string,
    params: UpdateGigInput,
  ): Promise<ServiceResult<Gig>> {
    try {
      const supabase = getSupabaseServerClient();

      // Auto-generate slug if title is being updated
      let slug: string | undefined;
      if (params.title) {
        slug = slugify(params.title);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "update_gig_if_owner_or_admin",
        {
          p_gig_id: id,
          p_caller_profile_id: callerProfileId,
          p_caller_role: callerRole,
          p_category: params.category ?? null,
          p_title: params.title ?? null,
          p_slug: slug ?? null,
          p_description: params.description ?? null,
          p_images: params.images ?? null,
          p_tags: params.tags ?? null,
          p_packages: params.packages ?? null,
          p_faq: params.faq ?? null,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        gig_id?: string;
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Cannot update gig");
      }

      // Fetch the updated gig
      const { data: updatedGig, error: fetchError } = await supabase
        .from(this.collection)
        .select(
          `
          *,
          seller:profile!gig_seller_fkey (
            id, name, username, avatar, verified, department
          ),
          category:category!gig_category_fkey (
            id, name, slug
          )
        `,
        )
        .eq("id", id)
        .single();

      if (fetchError) {
        return error(fetchError.message);
      }

      return success(updatedGig as unknown as Gig);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Delete a gig safely (seller or admin only).
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
        "delete_gig_if_owner_or_admin",
        {
          p_gig_id: id,
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
          ...error(result.error ?? "Cannot delete gig"),
          references: result.references,
        };
      }

      return success({ deleted_id: result.deleted_id! });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get gigs by seller.
   *
   * - **Public** (default, `isOwner = false`): only `ACTIVE` gigs.
   * - **The seller themselves or an admin** (`isOwner = true`): all statuses except `DELETED`.
   *
   * When `isOwner = true`, the caller MUST be the seller themselves or an admin.
   * This is enforced by the route layer (JWT check).
   */
  static async getBySeller(
    sellerId: string,
    params: PaginationOptions & {
      category?: string;
      search?: string;
      tags?: string[];
      status?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      /** When `true`, the caller is the seller or an admin — shows all non-deleted gigs. */
      isOwner?: boolean;
    },
  ): Promise<ServiceResult<{ items: Gig[]; total: number }>> {
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
      } = params;

      let query = supabase.from(this.collection).select(
        `
          *,
          seller:profile!gig_seller_fkey (
            id, name, username, avatar, verified, department
          ),
          category:category!gig_category_fkey (
            id, name, slug
          )
        `,
        { count: "exact", head: false },
      );

      // Always filter by seller
      query = query.eq("seller", sellerId);

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
        "price",
      ];
      const actualSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : "created_at";

      if (actualSortBy === "price") {
        query = query.order("packages->0->>price", {
          ascending: sortOrder === "asc",
          nullsFirst: false,
        });
      } else {
        query = query.order(actualSortBy, {
          ascending: sortOrder === "asc",
          nullsFirst: false,
        });
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as unknown as Gig[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
