import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { JobService } from "@/services/job.service";
import { parsePagination, parseSorting } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";

// ─── GET /api/job/manage (owner or admin) ─────────────────────────
// Returns paginated list of the caller's own jobs (or all if admin).
// Shows all statuses except DELETED.
//
// Query parameters:
//   page, limit          — pagination
//   sortBy, sortOrder    — sorting (created_at, updated_at, title, views, deadline, budget)
//   status               — filter by specific status
//   search               — search in title/description
//   category             — filter by category UUID
//   type                 — filter by job type
//   tags                 — comma-separated tag filter
export const GET = withAuth({
  handler: async ({ req, user }) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const { page, limit } = parsePagination(searchParams);
      const { sortBy, sortOrder } = parseSorting(searchParams, [
        "created_at",
        "updated_at",
        "title",
        "views",
        "deadline",
        "budget",
      ]);

      const status = searchParams.get("status") || undefined;
      const search = searchParams.get("search") || undefined;
      const category = searchParams.get("category") || undefined;
      const type = searchParams.get("type") || undefined;

      const tagsParam = searchParams.get("tags");
      const tags = tagsParam
        ? tagsParam
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined;

      const result = await JobService.getByOwner(user.profile, {
        page,
        limit,
        category,
        search,
        tags,
        type,
        sortBy,
        sortOrder,
        status,
        isOwner: true,
      });

      if (!result.success) {
        return fail({ error: result.error, statusCode: 500 });
      }

      const pagination = paginationMeta({
        page,
        limit,
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
  },
});
