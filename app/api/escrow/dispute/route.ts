import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import {
  requestDisputeSchema,
  type RequestDisputeInput,
} from "@/lib/validations/escrow.schema";
import { EscrowService } from "@/services/escrow.service";

/**
 * POST /api/escrow/dispute
 *
 * Seller requests a dispute on a DELIVERED order.
 *
 * Body: { order_id: string, reason: string }
 *
 * - Only the seller can dispute
 * - Order must be in DELIVERED status
 * - Atomically sets order + escrow to REVIEW via the `request_dispute` RPC
 */
export const POST = withAuth({
  handler: async ({ req, user }) => {
    try {
      const parsed = await parseBody(req, requestDisputeSchema);
      if (parsed instanceof Response) return parsed as never;

      const { order_id, reason } = parsed as RequestDisputeInput;

      const result = await EscrowService.requestDispute(
        order_id,
        user.profile,
        reason,
      );

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Dispute requested successfully. Admin will review shortly.",
        statusCode: 200,
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
