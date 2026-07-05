import { ok, fail, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { OrderService } from "@/services/order.service";
import { cancelOrderSchema } from "@/lib/validations/order.schema";

// ─── PATCH /api/order/:id/cancel (buyer or seller) ────────────────
// Cancels an order. Either participant (buyer or seller) may cancel.
// Requires a cancellation reason in the request body.
export const PATCH = withAuth({
  handler: async ({ req, user, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Order ID is required", statusCode: 400 });
      }

      const payload = await parseBody(req, cancelOrderSchema);
      if (payload instanceof Response) return payload;

      const result = await OrderService.cancel(
        id,
        user.profile,
        payload.reason,
      );

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Order cancelled successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
