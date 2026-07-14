import { fail, ok } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { EscrowService } from "@/services/escrow.service";

/**
 * GET /api/escrow/my
 *
 * Returns the authenticated user's escrow records (as sender or receiver).
 *
 * Query params:
 *   - page   (default: 1)
 *   - limit  (default: 20, max: 50)
 */
export const GET = withAuth({
  handler: async ({ req, user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
      const limit = Math.min(
        50,
        Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)),
      );

      const result = await EscrowService.getUserEscrows(user.profile, {
        page,
        limit,
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
});
