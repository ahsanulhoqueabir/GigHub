import { fail, ok } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { OrderService } from "@/services/order.service";

/**
 * PATCH /api/order/:id/deliver
 *
 * Seller marks an ACTIVE order as DELIVERED.
 *
 * Transitions: ACTIVE → DELIVERED
 *
 * Calls the `deliver_order` RPC which validates:
 * 1. Order exists
 * 2. Caller is the seller
 * 3. Order status is ACTIVE
 */
export const PATCH = withAuth({
  handler: async ({ user, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Order ID is required", statusCode: 400 });
      }

      const result = await OrderService.deliver(id, user.profile);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Order marked as delivered",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
