import { NextRequest } from "next/server";
import { ok, fail, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { CategoryService } from "@/services/category.service";
import { createCategorySchema } from "@/lib/validations/category.schema";
import { parsePagination, parseSorting } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";

// ─── GET /api/category (public) ────────────────────────────────────
// Returns paginated list of categories. Supports ?parent=null for root-only.
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(searchParams);
    const { sortBy, sortOrder } = parseSorting(searchParams, [
      "name",
      "ordering",
      "created_at",
      "slug",
    ]);

    // Check if tree mode is requested
    const tree = searchParams.get("tree");
    if (tree === "true") {
      const result = await CategoryService.getTree();
      if (!result.success) {
        return fail({ error: result.error, statusCode: 500 });
      }
      return ok({ data: result.data });
    }

    // Check for parent filter
    const parentParam = searchParams.get("parent");
    let parent: string | null | undefined = undefined;
    if (parentParam === "null") {
      parent = null; // root categories only
    } else if (parentParam) {
      parent = parentParam;
    }

    // Check for slug filter
    const slug = searchParams.get("slug");
    if (slug) {
      const result = await CategoryService.getBySlug(slug);
      if (!result.success) {
        return fail({ error: result.error, statusCode: 404 });
      }
      return ok({ data: result.data });
    }

    const result = await CategoryService.list({
      page,
      limit,
      parent,
      sortBy,
      sortOrder,
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

// ─── POST /api/category (admin only) ───────────────────────────────
export const POST = withAuth({
  handler: async ({ req }) => {
    try {
      const payload = await parseBody(req, createCategorySchema);
      if (payload instanceof Response) return payload;

      const result = await CategoryService.create(payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Category created successfully",
        statusCode: 201,
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
  options: { allowedRoles: ["ADMIN"] },
});
