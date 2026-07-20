import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { paginationParams } from "@/lib/pagination";
import type { Announcement } from "@/types/db/announcement.types";
import type { ServiceResult } from "@/types/generic.types";

export type PublicAnnouncementListItem = Pick<
  Announcement,
  "id" | "title" | "type" | "created_at"
>;

export type PublicAnnouncementDetail = Pick<
  Announcement,
  "title" | "content" | "type" | "created_at"
>;

const PUBLIC_LIST_FIELDS = "id, title, type, created_at";
const PUBLIC_DETAIL_FIELDS = "title, content, type, created_at, is_active, starts_at, ends_at";

/**
 * Read-only announcement access for unauthenticated mobile/web clients.
 * Kept separate from AnnouncementService so admin responses are never
 * accidentally narrowed and public responses never leak inactive/full data.
 */
export class PublicAnnouncementService {
  private static collection = "announcements";

  /**
   * Paginated list of currently active, non-expired, already-started
   * announcements. Fixed at 20 per page regardless of caller input.
   */
  static async list(params: {
    page?: number;
  }): Promise<
    ServiceResult<{ items: PublicAnnouncementListItem[]; total: number }>
  > {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams({
        page: params.page,
        limit: 20,
      });
      const nowIso = new Date().toISOString();

      const { data, error: sbError, count } = await supabase
        .from(this.collection)
        .select(PUBLIC_LIST_FIELDS, { count: "exact", head: false })
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
        .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as PublicAnnouncementListItem[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Fetch a single announcement by id, only if it is active and currently
   * within its starts_at/ends_at window. Returns an error otherwise so the
   * route can respond 404 without distinguishing "not found" from
   * "inactive"/"expired" to the caller.
   */
  static async getById(
    id: string,
  ): Promise<ServiceResult<PublicAnnouncementDetail>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select(PUBLIC_DETAIL_FIELDS)
        .eq("id", id)
        .single();

      if (sbError || !data) {
        return error("Announcement not found");
      }

      const announcement = data as Announcement;
      const now = Date.now();

      if (!announcement.is_active) {
        return error("Announcement not found");
      }
      if (
        announcement.starts_at &&
        new Date(announcement.starts_at).getTime() > now
      ) {
        return error("Announcement not found");
      }
      if (
        announcement.ends_at &&
        new Date(announcement.ends_at).getTime() < now
      ) {
        return error("Announcement not found");
      }

      return success({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        created_at: announcement.created_at,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
