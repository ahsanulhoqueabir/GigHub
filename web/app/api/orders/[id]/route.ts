import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { OrderService } from "@/services/order.service";
import type { JwtPayload } from "@/types/business/user.types";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/orders/[id] - Get order detail
 */
export const GET = withAuth<RouteContext>(
  async (_req: NextRequest, jwtPayload: JwtPayload, context: RouteContext) => {
    try {
      const { id } = await context.params;

      const result = await OrderService.getById(id);

      if (!result.success) {
        return fail({ error: "Order not found", statusCode: 404 });
      }

      const order = result.data;
      const buyerId =
        typeof order.buyer === "string"
          ? order.buyer
          : (order.buyer as { id: string }).id;
      const sellerId =
        typeof order.seller === "string"
          ? order.seller
          : (order.seller as { id: string }).id;

      // Only buyer or seller can view the order
      if (buyerId !== jwtPayload.profile && sellerId !== jwtPayload.profile) {
        return fail({
          error: "You are not allowed to view this order",
          statusCode: 403,
        });
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

/**
 * PATCH /api/orders/[id] - Update order status
 */
export const PATCH = withAuth<RouteContext>(
  async (req: NextRequest, jwtPayload: JwtPayload, context: RouteContext) => {
    try {
      const { id } = await context.params;
      const body = await req.json();
      const { status, cancellation_reason } = body;

      if (!status) {
        return fail({ error: "status is required" });
      }

      const validStatuses = ["processing", "cancelled", "completed"];
      if (!validStatuses.includes(status)) {
        return fail({
          error: `status must be one of: ${validStatuses.join(", ")}`,
        });
      }

      // Verify order exists and check permissions
      const orderResult = await OrderService.getById(id);
      if (!orderResult.success) {
        return fail({ error: "Order not found", statusCode: 404 });
      }

      const order = orderResult.data;
      const buyerId =
        typeof order.buyer === "string"
          ? order.buyer
          : (order.buyer as { id: string }).id;
      const sellerId =
        typeof order.seller === "string"
          ? order.seller
          : (order.seller as { id: string }).id;

      // Both buyer and seller can update order status
      if (buyerId !== jwtPayload.profile && sellerId !== jwtPayload.profile) {
        return fail({
          error: "You are not allowed to modify this resource",
          statusCode: 403,
        });
      }

      // Seller can mark as processing/completed; buyer can cancel
      if (status === "cancelled" && buyerId !== jwtPayload.profile) {
        return fail({
          error: "Only the buyer can cancel this order",
          statusCode: 403,
        });
      }

      const result = await OrderService.updateStatus(id, {
        status,
        cancellation_reason,
      });

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
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
