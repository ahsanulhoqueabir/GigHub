import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { OrderService } from "@/services/order.service";

// ─── GET /api/order/:id (participant or admin) ────────────────────
// Returns a single order by ID.
// Visibility is enforced by RLS (participants and admins only).
export const GET = withAuth({
  handler: async ({ params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Order ID is required", statusCode: 400 });
      }

      const result = await OrderService.getById(id);

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

// ─── DELETE /api/order/:id (participant or admin) ─────────────────
// Permanently deletes a PENDING order.
// Validates: status is PENDING, caller is buyer/seller/admin.
// Cascades to chat_room and escrow via ON DELETE CASCADE.
export const DELETE = withAuth({
  handler: async ({ user, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Order ID is required", statusCode: 400 });
      }

      const result = await OrderService.delete(id, user.profile, user.role);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Order deleted successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
