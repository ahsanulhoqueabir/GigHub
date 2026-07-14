import { fail, ok } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { EscrowService } from "@/services/escrow.service";

/**
 * GET /api/admin/escrow
 *
 * Admin: list all escrows with optional status/search filters.
 *
 * Query params:
 *   - page   (default: 1)
 *   - limit  (default: 20, max: 50)
 *   - status (optional: PENDING | ACTIVE | REVIEW | COMPLETED | CANCELLED)
 *   - search (optional: transaction_id substring)
 */
export const GET = withAuth({
  handler: async ({ req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
      const limit = Math.min(
        50,
        Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)),
      );
      const status = searchParams.get("status") ?? undefined;
      const search = searchParams.get("search") ?? undefined;

      const result = await EscrowService.listAll({
        page,
        limit,
        status,
        search,
      });

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
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
