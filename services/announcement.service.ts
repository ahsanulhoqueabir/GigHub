import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { sendAnnouncementPush } from "@/lib/firebase/send-topic-notification";
import { paginationParams } from "@/lib/pagination";
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "@/lib/validations/announcement.schema";
import type { Announcement } from "@/types/db/announcement.types";
import type { ServiceResult } from "@/types/generic.types";
import type { PaginationOptions } from "@/types/pagination.types";

export class AnnouncementService {
  private static collection = "announcements";

  /**
   * Create a new announcement (admin only).
   */
  static async create(
    params: CreateAnnouncementInput,
  ): Promise<ServiceResult<Announcement>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .insert({
          title: params.title,
          content: params.content,
          type: params.type ?? "info",
          is_active: params.is_active,
          send_push: params.send_push,
          starts_at: params.starts_at ?? null,
          ends_at: params.ends_at ?? null,
        })
        .select()
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      const announcement = data as Announcement;

      // Database insert is the source of truth; Firebase delivery is
      // best-effort and must never fail or roll back the create request.
      // We await but catch any error so the API response is never blocked
      // or failed due to a push delivery issue.
      if (announcement.send_push) {
        sendAnnouncementPush({
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
        }).catch(() => {
          /* best-effort — never throw from push */
        });
      }

      return success(announcement);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get paginated list of announcements (admin).
   */
  static async list(
    params: PaginationOptions & {
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<ServiceResult<{ items: Announcement[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const { sortBy = "created_at", sortOrder = "desc" } = params;

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
        items: (data as Announcement[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a single announcement by ID (admin).
   */
  static async getById(id: string): Promise<ServiceResult<Announcement>> {
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
        return error("Announcement not found");
      }

      return success(data as Announcement);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update an announcement (admin only).
   */
  static async update(
    id: string,
    params: UpdateAnnouncementInput,
  ): Promise<ServiceResult<Announcement>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .update({
          ...params,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as Announcement);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Delete an announcement (admin only).
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
