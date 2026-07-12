import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { uploadIfBase64 } from "@/lib/image-upload";
import { paginationParams } from "@/lib/pagination";
import type {
  CreateAdBannerInput,
  UpdateAdBannerInput,
} from "@/lib/validations/ad-banner.schema";
import type { AdBanner } from "@/types/db/ad-banner.types";
import type { ServiceResult } from "@/types/generic.types";
import type { PaginationOptions } from "@/types/pagination.types";

const CLOUDINARY_FOLDER = "gighub/ad-banners";

export class AdBannerService {
  private static collection = "ad_banners";

  /**
   * Create a new ad banner (admin only).
   * If image_url is a base64 string, it will be uploaded to Cloudinary first.
   */
  static async create(
    params: CreateAdBannerInput,
  ): Promise<ServiceResult<AdBanner>> {
    try {
      const supabase = getSupabaseServerClient();

      // Upload base64 image to Cloudinary if needed
      const image_url = await uploadIfBase64(
        params.image_url,
        CLOUDINARY_FOLDER,
      );
      if (!image_url) {
        return error("Banner image is required");
      }

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .insert({
          name: params.name,
          placement: params.placement,
          image_url,
          alt_text: params.alt_text,
          target_url: params.target_url ?? null,
          sort_order: params.sort_order,
          is_active: params.is_active,
          starts_at: params.starts_at ?? null,
          ends_at: params.ends_at ?? null,
        })
        .select()
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as AdBanner);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get paginated list of ad banners (admin).
   */
  static async list(
    params: PaginationOptions & {
      placement?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<ServiceResult<{ items: AdBanner[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const { placement, sortBy = "sort_order", sortOrder = "asc" } = params;

      let query = supabase
        .from(this.collection)
        .select("*", { count: "exact", head: false });

      if (placement) {
        query = query.eq("placement", placement);
      }

      query = query.order(sortBy, { ascending: sortOrder === "asc" });
      query = query.range(offset, offset + limit - 1);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as AdBanner[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a single ad banner by ID (admin).
   */
  static async getById(id: string): Promise<ServiceResult<AdBanner>> {
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
        return error("Ad banner not found");
      }

      return success(data as AdBanner);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update an ad banner (admin only).
   * If image_url is a base64 string, it will be uploaded to Cloudinary first.
   */
  static async update(
    id: string,
    params: UpdateAdBannerInput,
  ): Promise<ServiceResult<AdBanner>> {
    try {
      const supabase = getSupabaseServerClient();

      // Upload base64 image to Cloudinary if needed
      const updateData: Record<string, unknown> = {
        ...params,
        updated_at: new Date().toISOString(),
      };
      if (params.image_url) {
        updateData.image_url = await uploadIfBase64(
          params.image_url,
          CLOUDINARY_FOLDER,
        );
      }

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as AdBanner);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Delete an ad banner (admin only).
   */
  static async delete(
    id: string,
  ): Promise<ServiceResult<{ deleted_id: string }>> {
    try {
      const supabase = getSupabaseServerClient();

      const { error: sbError } = await supabase
        .from(this.collection)
        .delete()
        .eq("id", id);

      if (sbError) {
        return error(sbError.message);
      }

      return success({ deleted_id: id });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
