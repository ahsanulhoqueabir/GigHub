import { SSLCommerzService } from "@/services/sslcommerz.service";
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
    const platform = formData.get("value_b")?.toString();

    return NextResponse.redirect(
      SSLCommerzService.buildReturnUrl(platform, orderId, "failed"),
      { status: 303 },
    );
  } catch {
    return NextResponse.redirect(
      SSLCommerzService.buildReturnUrl(undefined, "", "failed"),
      { status: 303 },
    );
  }
}
