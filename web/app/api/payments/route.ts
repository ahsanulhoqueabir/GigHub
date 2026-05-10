import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { PaymentService } from "@/services/payment.service";
import type { JwtPayload } from "@/types/business/user.types";

/**
 * GET /api/payments?type=balance|transactions|escrow&order_id=...
 */
export const GET = withAuth(
  async (req: NextRequest, jwtPayload: JwtPayload) => {
    try {
      const { searchParams } = new URL(req.url);
      const type = searchParams.get("type");

      if (!type) {
        return fail({
          error:
            "type query parameter is required (balance, transactions, or escrow)",
        });
      }

      switch (type) {
        case "balance": {
          const result = await PaymentService.getBalance(jwtPayload.profile);
          if (!result.success) {
            return fail({ error: result.error, statusCode: 500 });
          }
          return ok({ data: result.data });
        }

        case "transactions": {
          const page = parseInt(searchParams.get("page") || "1");
          const limit = parseInt(searchParams.get("limit") || "10");

          const result = await PaymentService.getTransactions(
            jwtPayload.profile,
            page,
            limit,
          );

          if (!result.success) {
            return fail({ error: result.error, statusCode: 500 });
          }

          const { transactions, total } = result.data;
          const totalPages = Math.ceil(total / limit);

          return ok({
            data: transactions,
            pagination: {
              currentPage: page,
              totalPages,
              totalCount: total,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
            },
          });
        }

        case "escrow": {
          const orderId = searchParams.get("order_id");
          if (!orderId) {
            return fail({ error: "order_id is required for escrow type" });
          }

          const result = await PaymentService.getEscrowByOrder(
            orderId,
            jwtPayload.profile,
          );

          if (!result.success) {
            return fail({ error: result.error, statusCode: 404 });
          }

          return ok({ data: result.data });
        }

        default:
          return fail({
            error: "Invalid type. Must be balance, transactions, or escrow",
          });
      }
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
);
