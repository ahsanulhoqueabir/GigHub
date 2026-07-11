import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { updateHeroBannerSchema } from "@/lib/validations/hero-banner.schema";
import { HeroBannerService } from "@/services/hero-banner.service";

// ─── GET /api/admin/hero-banners/:id (admin only) ─────────────────
export const GET = withAuth({
  handler: async ({ params }) => {
    try {
      const id = params?.id;
      if (!id)
        return fail({ error: "Hero banner ID is required", statusCode: 400 });

      const result = await HeroBannerService.getById(id);

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

// ─── PATCH /api/admin/hero-banners/:id (admin only) ───────────────
export const PATCH = withAuth({
  handler: async ({ req, params }) => {
    try {
      const id = params?.id;
      if (!id)
        return fail({ error: "Hero banner ID is required", statusCode: 400 });

      const payload = await parseBody(req, updateHeroBannerSchema);
      if (payload instanceof Response) return payload;

      const result = await HeroBannerService.update(id, payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Hero banner updated successfully",
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

// ─── DELETE /api/admin/hero-banners/:id (admin only) ──────────────
export const DELETE = withAuth({
  handler: async ({ params }) => {
    try {
      const id = params?.id;
      if (!id)
        return fail({ error: "Hero banner ID is required", statusCode: 400 });

      const result = await HeroBannerService.delete(id);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Hero banner deleted successfully",
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
