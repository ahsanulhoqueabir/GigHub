import { NextRequest } from "next/server";
import { ok, fail, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { JobService } from "@/services/job.service";
import { createJobSchema } from "@/lib/validations/job.schema";
import { parsePagination, parseSorting } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";

// ─── GET /api/job (public) ────────────────────────────────────────
// Returns paginated list of jobs with advanced filtering.
// Only ACTIVE jobs are visible to the public.
//
// Query parameters:
//   page, limit          — pagination
//   sortBy, sortOrder    — sorting (created_at, updated_at, title, views, deadline, budget)
//   category             — filter by category UUID
//   owner                — filter by owner UUID
//   search               — search in title/description
//   tags                 — comma-separated tag filter
//   type                 — filter by job type (PARTTIME, FULLTIME, etc.)
//   status               — filter by status (public: only ACTIVE by default)
//   slug                 — get single job by slug
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(searchParams);
    const { sortBy, sortOrder } = parseSorting(searchParams, [
      "created_at",
      "updated_at",
      "title",
      "views",
      "deadline",
      "budget",
    ]);

    // Check for slug filter (single job by slug)
    const slug = searchParams.get("slug");
    if (slug) {
      const result = await JobService.getBySlug(slug);
      if (!result.success) {
        return fail({ error: result.error, statusCode: 404 });
      }
      return ok({ data: result.data });
    }

    // Parse optional filters
    const category = searchParams.get("category") || undefined;
    const owner = searchParams.get("owner") || undefined;
    const search = searchParams.get("search") || undefined;
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;

    // Parse tags from comma-separated string
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam
      ? tagsParam
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    const result = await JobService.list({
      page,
      limit,
      category,
      owner,
      search,
      tags,
      type,
      sortBy,
      sortOrder,
      status,
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
}

// ─── POST /api/job (authenticated user) ───────────────────────────
// Creates a new job. Owner is extracted from JWT.
export const POST = withAuth({
  handler: async ({ req, user }) => {
    try {
      const payload = await parseBody(req, createJobSchema);
      if (payload instanceof Response) return payload;

      const result = await JobService.create(user.profile, payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Job created successfully",
        statusCode: 201,
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
