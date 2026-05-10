import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { SearchService } from "@/services/search.service";

/**
 * GET /api/search?collection=gigs|jobs|profiles&q=searchterm&category=...&skills=...
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get("collection") as
      | "gigs"
      | "jobs"
      | "profiles"
      | null;
    const q = searchParams.get("q");

    if (!collection || !q) {
      return fail({ error: "collection and q query parameters are required" });
    }

    if (!["gigs", "jobs", "profiles"].includes(collection)) {
      return fail({ error: "collection must be gigs, jobs, or profiles" });
    }

    const result = await SearchService.search({
      collection,
      q,
      category: searchParams.get("category") || undefined,
      skills: searchParams.get("skills") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
    });

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    const { results, total } = result.data;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const totalPages = Math.ceil(total / limit);

    return ok({
      data: results,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
