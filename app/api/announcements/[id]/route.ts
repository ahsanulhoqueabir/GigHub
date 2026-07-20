import { fail, ok } from "@/lib/api/api-response";
import { getRouteParam } from "@/lib/api/request-payload";
import { PublicAnnouncementService } from "@/services/public-announcement.service";
import { NextRequest } from "next/server";

// ─── GET /api/announcements/:id (public) ──────────────────────────
// 404 for not-found, inactive, and expired/not-yet-started alike — the
// caller must not be able to distinguish "doesn't exist" from "hidden".
export async function GET(
  _request: NextRequest,
  context: { params?: unknown },
) {
  try {
    const id = await getRouteParam(context, "id");
    if (!id) {
      return fail({ error: "Announcement ID is required", statusCode: 400 });
    }

    const result = await PublicAnnouncementService.getById(id);

    if (!result.success) {
      return fail({ error: "Announcement not found", statusCode: 404 });
    }

    return ok({ data: result.data });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
