import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { updateAdBannerSchema } from "@/lib/validations/ad-banner.schema";
import { AdBannerService } from "@/services/ad-banner.service";

// ─── GET /api/admin/ad-banners/:id (admin only) ───────────────────
export const GET = withAuth({
  handler: async ({ params }) => {
    try {
      const id = params?.id;
      if (!id)
        return fail({ error: "Ad banner ID is required", statusCode: 400 });

      const result = await AdBannerService.getById(id);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 404 });
      }

      return ok({ data: result.data });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
  options: { allowedRoles: ["ADMIN"] },
});

// ─── PATCH /api/admin/ad-banners/:id (admin only) ─────────────────
export const PATCH = withAuth({
  handler: async ({ req, params }) => {
    try {
      const id = params?.id;
      if (!id)
        return fail({ error: "Ad banner ID is required", statusCode: 400 });

      const payload = await parseBody(req, updateAdBannerSchema);
      if (payload instanceof Response) return payload;

      const result = await AdBannerService.update(id, payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Ad banner updated successfully",
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

// ─── DELETE /api/admin/ad-banners/:id (admin only) ────────────────
export const DELETE = withAuth({
  handler: async ({ params }) => {
    try {
      const id = params?.id;
      if (!id)
        return fail({ error: "Ad banner ID is required", statusCode: 400 });

      const result = await AdBannerService.delete(id);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Ad banner deleted successfully",
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
