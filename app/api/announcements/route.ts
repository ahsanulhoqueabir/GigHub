import { fail, ok } from "@/lib/api/api-response";
import { paginationMeta } from "@/lib/pagination";
import { PublicAnnouncementService } from "@/services/public-announcement.service";
import { NextRequest } from "next/server";

// ─── GET /api/announcements (public) ──────────────────────────────
// Active, non-expired, already-started announcements only. 20 per page.
// Never returns full `content` — list callers must fetch details by id.
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageStr = searchParams.get("page");
    const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

    const result = await PublicAnnouncementService.list({ page });

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    const pagination = paginationMeta({
      page,
      limit: 20,
      totalItems: result.data.total,
    });

    return ok({
      data: {
        items: result.data.items,
        pagination,
      },
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
