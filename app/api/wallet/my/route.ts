import { fail, ok } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { WalletService } from "@/services/wallet.service";

/**
 * GET /api/wallet/my
 *
 * Returns the authenticated user's wallet (balance, currency, name).
 */
export const GET = withAuth({
  handler: async ({ user }) => {
    try {
      const result = await WalletService.getUserWallet(user.profile);

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
});
