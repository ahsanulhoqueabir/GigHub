import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { uploadIfBase64 } from "@/lib/image-upload";
import { paginationParams } from "@/lib/pagination";
import type {
  CreateHeroBannerInput,
  UpdateHeroBannerInput,
} from "@/lib/validations/hero-banner.schema";
import type { HeroBanner } from "@/types/db/hero-banner.types";
import type { ServiceResult } from "@/types/generic.types";
import type { PaginationOptions } from "@/types/pagination.types";

const CLOUDINARY_FOLDER = "gighub/hero-banners";

export class HeroBannerService {
  private static collection = "hero_banners";

  /**
   * Create a new hero banner (admin only).
   * If image_url is a base64 string, it will be uploaded to Cloudinary first.
   */
  static async create(
    params: CreateHeroBannerInput,
  ): Promise<ServiceResult<HeroBanner>> {
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
          title: params.title,
          subtitle: params.subtitle ?? null,
          image_url,
          alt_text: params.alt_text,
          button_text: params.button_text ?? null,
          button_url: params.button_url ?? null,
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

      return success(data as HeroBanner);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get paginated list of hero banners (admin).
   */
  static async list(
    params: PaginationOptions & {
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<ServiceResult<{ items: HeroBanner[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const { sortBy = "sort_order", sortOrder = "asc" } = params;

      let query = supabase
        .from(this.collection)
        .select("*", { count: "exact", head: false });

      query = query.order(sortBy, { ascending: sortOrder === "asc" });
      query = query.range(offset, offset + limit - 1);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as HeroBanner[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a single hero banner by ID (admin).
   */
  static async getById(id: string): Promise<ServiceResult<HeroBanner>> {
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
        return error("Hero banner not found");
      }

      return success(data as HeroBanner);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update a hero banner (admin only).
   * If image_url is a base64 string, it will be uploaded to Cloudinary first.
   */
  static async update(
    id: string,
    params: UpdateHeroBannerInput,
  ): Promise<ServiceResult<HeroBanner>> {
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

      return success(data as HeroBanner);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Delete a hero banner (admin only).
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
