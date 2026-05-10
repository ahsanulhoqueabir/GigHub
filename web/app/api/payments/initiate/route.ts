import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { PaymentService } from "@/services/payment.service";
import type { JwtPayload } from "@/types/business/user.types";

/**
 * POST /api/payments/initiate - Initiate payment for an order
 */
export const POST = withAuth(
  async (req: NextRequest, jwtPayload: JwtPayload) => {
    try {
      const body = await req.json();
      const { order_id } = body;

      if (!order_id) {
        return fail({ error: "order_id is required" });
      }

      const result = await PaymentService.initiatePayment(
        order_id,
        jwtPayload.profile,
      );

      if (!result.success) {
        const statusCode =
          result.error === "Order not found"
            ? 404
            : result.error.includes("not allowed")
              ? 403
              : 400;
        return fail({ error: result.error, statusCode });
      }

      return ok({ data: result.data });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
);
