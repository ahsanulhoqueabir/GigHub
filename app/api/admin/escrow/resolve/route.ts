import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { EscrowService } from "@/services/escrow.service";
import { resolveDisputeSchema } from "@/lib/validations/escrow.schema";

/**
 * POST /api/admin/escrow/resolve
 *
 * Admin resolves a disputed escrow (order in REVIEW status).
 *
 * Body: { order_id: string, resolution: "RELEASE" | "REFUND", admin_note?: string }
 *
 * - RELEASE → credits seller wallet (amount - platform_fee), order → COMPLETED
 * - REFUND  → credits buyer wallet (full amount), order → CANCELLED
 *
 * Atomically executed via the `resolve_dispute` RPC.
 */
export const POST = withAuth({
  handler: async ({ req, user }) => {
    try {
      const body = await parseBody(req, resolveDisputeSchema);
      if (body instanceof Response) return body as never;

      const { order_id, resolution, admin_note } = body;

      const result = await EscrowService.resolveDispute(
        order_id,
        user.profile,
        resolution,
        admin_note,
      );

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      const message =
        resolution === "RELEASE"
          ? "Dispute resolved: funds released to seller"
          : "Dispute resolved: funds refunded to buyer";

      return ok({
        data: result.data,
        message,
        statusCode: 200,
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
  options: { allowedRoles: ["ADMIN"] },
});
