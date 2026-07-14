import { fail, ok } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { WalletService } from "@/services/wallet.service";

/**
 * GET /api/wallet/records
 *
 * Returns paginated wallet records (transaction history) for the
 * authenticated user.
 *
 * Query params:
 *   - page  (default: 1)
 *   - limit (default: 20, max: 50)
 *   - type  (optional: CREDIT | DEBIT)
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
      const typeParam = searchParams.get("type");
      const type =
        typeParam === "CREDIT" || typeParam === "DEBIT" ? typeParam : undefined;

      const result = await WalletService.getUserWalletRecords(user.profile, {
        page,
        limit,
        type,
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
