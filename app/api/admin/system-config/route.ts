import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { updateSystemConfigSchema } from "@/lib/validations/system-config.schema";
import { SystemConfigService } from "@/services/system-config.service";

// ─── GET /api/admin/system-config (admin only) ────────────────────
export const GET = withAuth({
  handler: async () => {
    try {
      const result = await SystemConfigService.get();

      if (!result.success) {
        return fail({ error: result.error, statusCode: 500 });
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

// ─── PATCH /api/admin/system-config (admin only) ──────────────────
export const PATCH = withAuth({
  handler: async ({ req }) => {
    try {
      const payload = await parseBody(req, updateSystemConfigSchema);
      if (payload instanceof Response) return payload;

      const result = await SystemConfigService.update(payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "System configuration updated successfully",
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
