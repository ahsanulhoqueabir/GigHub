import { app } from "@/config/env.config";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/payment/fail
 *
 * SSLCommerz failure callback.
 *
 * Called by SSLCommerz when the payment fails. The order and escrow remain
 * in PENDING/UNPAID state — the buyer can retry payment.
 *
 * Redirects the buyer back to the order page with a failure indicator.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const orderId = formData.get("value_a")?.toString() ?? "";

    const redirectUrl = orderId
      ? `${app.url}/orders/${orderId}?payment=failed`
      : `${app.url}/orders?payment=failed`;

    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch {
    return NextResponse.redirect(`${app.url}/orders?payment=failed`, {
      status: 303,
    });
  }
}
