import { NextRequest } from "next/server";
import { ok, fail, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { GigService } from "@/services/gig.service";
import { createGigSchema } from "@/lib/validations/gig.schema";
import { parsePagination, parseSorting } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";

// ─── GET /api/gig (public) ────────────────────────────────────────
// Returns paginated list of gigs with advanced filtering.
// Only ACTIVE gigs are visible to the public.
//
// Query parameters:
//   page, limit          — pagination
//   sortBy, sortOrder    — sorting (created_at, updated_at, title, views, price)
//   category             — filter by category UUID
//   seller               — filter by seller UUID
//   search               — search in title/description
//   tags                 — comma-separated tag filter
//   status               — filter by status (public: only ACTIVE by default)
//   slug                 — get single gig by slug
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(searchParams);
    const { sortBy, sortOrder } = parseSorting(searchParams, [
      "created_at",
      "updated_at",
      "title",
      "views",
      "price",
    ]);

    // Check for slug filter (single gig by slug)
    const slug = searchParams.get("slug");
    if (slug) {
      const result = await GigService.getBySlug(slug);
      if (!result.success) {
        return fail({ error: result.error, statusCode: 404 });
      }
      return ok({ data: result.data });
    }

    // Parse optional filters
    const category = searchParams.get("category") || undefined;
    const seller = searchParams.get("seller") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    // Parse tags from comma-separated string
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam
      ? tagsParam
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    const result = await GigService.list({
      page,
      limit,
      category,
      seller,
      search,
      tags,
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

// ─── POST /api/gig (authenticated seller) ─────────────────────────
// Creates a new gig. Seller is extracted from JWT.
export const POST = withAuth({
  handler: async ({ req, user }) => {
    try {
      const payload = await parseBody(req, createGigSchema);
      if (payload instanceof Response) return payload;

      const result = await GigService.create(user.profile, payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Gig created successfully",
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
