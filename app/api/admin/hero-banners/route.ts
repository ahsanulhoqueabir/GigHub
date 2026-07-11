import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { parsePagination, parseSorting } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";
import { createHeroBannerSchema } from "@/lib/validations/hero-banner.schema";
import { HeroBannerService } from "@/services/hero-banner.service";

// ─── GET /api/admin/hero-banners (admin only) ─────────────────────
export const GET = withAuth({
  handler: async ({ req }) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const { page, limit } = parsePagination(searchParams);
      const { sortBy, sortOrder } = parseSorting(searchParams, [
        "title",
        "sort_order",
        "is_active",
        "created_at",
      ]);

      const result = await HeroBannerService.list({
        page,
        limit,
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
  },
  options: { allowedRoles: ["ADMIN"] },
});

// ─── POST /api/admin/hero-banners (admin only) ────────────────────
export const POST = withAuth({
  handler: async ({ req }) => {
    try {
      const payload = await parseBody(req, createHeroBannerSchema);
      if (payload instanceof Response) return payload;

      const result = await HeroBannerService.create(payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Hero banner created successfully",
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
