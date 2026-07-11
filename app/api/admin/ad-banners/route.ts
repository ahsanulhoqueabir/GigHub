import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { parsePagination, parseSorting } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";
import { createAdBannerSchema } from "@/lib/validations/ad-banner.schema";
import { AdBannerService } from "@/services/ad-banner.service";

// ─── GET /api/admin/ad-banners (admin only) ───────────────────────
export const GET = withAuth({
  handler: async ({ req }) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const { page, limit } = parsePagination(searchParams);
      const { sortBy, sortOrder } = parseSorting(searchParams, [
        "name",
        "placement",
        "sort_order",
        "is_active",
        "created_at",
      ]);

      const placement = searchParams.get("placement") ?? undefined;

      const result = await AdBannerService.list({
        page,
        limit,
        sortBy,
        sortOrder,
        placement,
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

// ─── POST /api/admin/ad-banners (admin only) ──────────────────────
export const POST = withAuth({
  handler: async ({ req }) => {
    try {
      const payload = await parseBody(req, createAdBannerSchema);
      if (payload instanceof Response) return payload;

      const result = await AdBannerService.create(payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Ad banner created successfully",
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
