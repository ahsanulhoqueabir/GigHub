import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { OrderService } from "@/services/order.service";
import { GigService } from "@/services/gig.service";
import type { JwtPayload } from "@/types/business/user.types";

/**
 * POST /api/orders - Create a new order from a gig purchase
 */
export const POST = withAuth(
  async (req: NextRequest, jwtPayload: JwtPayload) => {
    try {
      const body = await req.json();
      const { gig_id, gig_package_tier, amount, proposal_id } = body;

      if (!gig_id || !gig_package_tier || !amount) {
        return fail({
          error: "gig_id, gig_package_tier, and amount are required",
        });
      }

      // Verify gig exists
      const gigResult = await GigService.getById(gig_id);
      if (!gigResult.success) {
        return fail({ error: "Gig not found", statusCode: 404 });
      }

      // Prevent buying your own gig
      const sellerId =
        typeof gigResult.data.seller === "string"
          ? gigResult.data.seller
          : (gigResult.data.seller as { id: string }).id;

      if (sellerId === jwtPayload.profile) {
        return fail({
          error: "You cannot purchase your own gig",
          statusCode: 403,
        });
      }

      const result = await OrderService.create({
        buyer: jwtPayload.profile,
        gig_id,
        gig_package_tier,
        amount,
        proposal_id,
      });

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({ data: result.data, statusCode: 201 });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
);

/**
 * GET /api/orders - Not implemented directly; use /api/orders/me
 */
export async function GET() {
  return fail({
    error: "Use /api/orders/me to list your orders",
    statusCode: 400,
  });
}
