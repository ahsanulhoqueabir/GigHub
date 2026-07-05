import { ok, fail, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { OrderService } from "@/services/order.service";
import { createJobOrderSchema } from "@/lib/validations/order.schema";

// ─── POST /api/order/job (authenticated) ──────────────────────────
// Creates a new Job order from an approved proposal.
// The order and chat room are created atomically via RPC.
// No escrow is created for job orders.
export const POST = withAuth({
  handler: async ({ req }) => {
    try {
      const payload = await parseBody(req, createJobOrderSchema);
      if (payload instanceof Response) return payload;

      const result = await OrderService.createJobOrder(payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Job order created successfully",
        statusCode: 201,
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
