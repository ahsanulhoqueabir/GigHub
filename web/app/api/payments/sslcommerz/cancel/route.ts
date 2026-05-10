import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { PaymentService } from "@/services/payment.service";

/**
 * POST /api/payments/sslcommerz/cancel - SSLCommerz cancel callback
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tran_id, order_id } = body;

    if (!tran_id || !order_id) {
      return fail({ error: "tran_id and order_id are required" });
    }

    const result = await PaymentService.handlePaymentStatus(
      order_id,
      tran_id,
      "cancelled",
    );

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    return ok({ data: result.data });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
