import { fail, ok } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { EscrowService } from "@/services/escrow.service";

/**
 * GET /api/escrow/order/:orderId
 *
 * Get the escrow record for a specific order.
 * Accessible by participants (buyer/seller) and admins — enforced by RLS.
 */
export const GET = withAuth({
  handler: async ({ params }) => {
    try {
      const orderId = params?.orderId;
      if (!orderId) {
        return fail({ error: "Order ID is required", statusCode: 400 });
      }

      const result = await EscrowService.getByOrderId(orderId);

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
