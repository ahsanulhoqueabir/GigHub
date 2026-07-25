import { SSLCommerzService } from "@/services/sslcommerz.service";
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
    const platform = formData.get("value_b")?.toString();

    return NextResponse.redirect(
      SSLCommerzService.buildReturnUrl(platform, orderId, "cancelled"),
      { status: 303 },
    );
  } catch {
    return NextResponse.redirect(
      SSLCommerzService.buildReturnUrl(undefined, "", "cancelled"),
      { status: 303 },
    );
  }
}
