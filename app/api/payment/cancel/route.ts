import { app } from "@/config/env.config";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/payment/cancel
 *
 * SSLCommerz cancellation callback.
 *
 * Called by SSLCommerz when the buyer cancels on the payment page. The
 * order and escrow remain in PENDING/UNPAID state — the buyer can retry
 * or cancel the order manually.
 *
 * Redirects the buyer back to the order page with a cancellation indicator.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const orderId = formData.get("value_a")?.toString() ?? "";

    const redirectUrl = orderId
      ? `${app.url}/orders/${orderId}?payment=cancelled`
      : `${app.url}/orders?payment=cancelled`;

    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch {
    return NextResponse.redirect(`${app.url}/orders?payment=cancelled`, {
      status: 303,
    });
  }
}
