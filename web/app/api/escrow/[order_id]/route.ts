import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { PaymentService } from "@/services/payment.service";
import type { JwtPayload } from "@/types/business/user.types";

type RouteContext = { params: Promise<{ order_id: string }> };

/**
 * GET /api/escrow/[order_id] - Get escrow detail for an order
 */
export const GET = withAuth<RouteContext>(
  async (_req: NextRequest, jwtPayload: JwtPayload, context: RouteContext) => {
    try {
      const { order_id } = await context.params;

      const result = await PaymentService.getEscrowByOrder(
        order_id,
        jwtPayload.profile,
      );

      if (!result.success) {
        const statusCode = result.error === "Escrow not found" ? 404 : 403;
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
