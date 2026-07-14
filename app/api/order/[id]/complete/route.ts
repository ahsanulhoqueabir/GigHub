import { fail, ok } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { OrderService } from "@/services/order.service";

/**
 * PATCH /api/order/:id/complete
 *
 * Buyer completes a DELIVERED order, releasing escrow funds to the seller.
 *
 * Transitions: DELIVERED → COMPLETED
 *
 * Atomically via the `complete_order` RPC:
 * 1. Validates caller is buyer & order is DELIVERED
 * 2. Updates order → COMPLETED
 * 3. Updates escrow → COMPLETED + released_at
 * 4. Credits seller wallet: balance += (amount - platform_fee)
 * 5. Creates CREDIT wallet_record for seller
 */
export const PATCH = withAuth({
  handler: async ({ user, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Order ID is required", statusCode: 400 });
      }

      const result = await OrderService.complete(id, user.profile);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Order completed and payment released to seller",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
