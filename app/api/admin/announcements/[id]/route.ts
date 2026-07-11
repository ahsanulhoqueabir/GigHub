import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { updateAnnouncementSchema } from "@/lib/validations/announcement.schema";
import { AnnouncementService } from "@/services/announcement.service";

// ─── GET /api/admin/announcements/:id (admin only) ────────────────
export const GET = withAuth({
  handler: async ({ params }) => {
    try {
      const id = params?.id;
      if (!id)
        return fail({ error: "Announcement ID is required", statusCode: 400 });

      const result = await AnnouncementService.getById(id);

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

// ─── PATCH /api/admin/announcements/:id (admin only) ──────────────
export const PATCH = withAuth({
  handler: async ({ req, params }) => {
    try {
      const id = params?.id;
      if (!id)
        return fail({ error: "Announcement ID is required", statusCode: 400 });

      const payload = await parseBody(req, updateAnnouncementSchema);
      if (payload instanceof Response) return payload;

      const result = await AnnouncementService.update(id, payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Announcement updated successfully",
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

// ─── DELETE /api/admin/announcements/:id (admin only) ─────────────
export const DELETE = withAuth({
  handler: async ({ params }) => {
    try {
      const id = params?.id;
      if (!id)
        return fail({ error: "Announcement ID is required", statusCode: 400 });

      const result = await AnnouncementService.delete(id);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Announcement deleted successfully",
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
