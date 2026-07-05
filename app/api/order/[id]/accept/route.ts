import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { OrderService } from "@/services/order.service";

// ─── PATCH /api/order/:id/accept (buyer only) ─────────────────────
// Accepts a PENDING order. Only the buyer can accept.
// Transitions: PENDING → ACTIVE
export const PATCH = withAuth({
  handler: async ({ user, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Order ID is required", statusCode: 400 });
      }

      const result = await OrderService.accept(id, user.profile);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Order accepted successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
