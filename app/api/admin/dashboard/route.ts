import { fail, ok } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { AdminDashboardService } from "@/services/admin-dashboard.service";

// ─── GET /api/admin/dashboard (admin only) ────────────────────────
// Returns comprehensive dashboard data (stats, charts, recent items, etc.)
export const GET = withAuth({
  handler: async () => {
    try {
      const result = await AdminDashboardService.getDashboardData();

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
