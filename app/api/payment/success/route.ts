import { app } from "@/config/env.config";
import { EscrowService } from "@/services/escrow.service";
import { SSLCommerzService } from "@/services/sslcommerz.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/payment/success
 *
 * SSLCommerz IPN (Instant Payment Notification) and success redirect handler.
 *
 * Called by SSLCommerz server-side after a successful payment.
 * Also used as the buyer success_url redirect target.
 *
 * Flow:
 * 1. Parse IPN payload from SSLCommerz (form-encoded body)
 * 2. Validate transaction via SSLCommerz validation API
 * 3. Call EscrowService.processPaymentSuccess (atomic escrow + wallet_record)
 * 4. Redirect buyer to order page
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // SSLCommerz sends form-encoded body
    const formData = await req.formData();
    const payload: Record<string, string> = {};
    formData.forEach((value, key) => {
      payload[key] = value.toString();
    });

    const {
      status,
      tran_id,
      amount,
      currency = "BDT",
      value_a: orderId,
    } = payload;

    // Must have a tran_id and orderId
    if (!tran_id || !orderId) {
      return NextResponse.redirect(
        `${app.url}/profile/orders?payment=failed&reason=missing_params`,
        { status: 303 },
      );
    }

    // Validate with SSLCommerz (only if status is VALID or VALIDATED)
    if (status !== "VALID" && status !== "VALIDATED") {
      return NextResponse.redirect(
        `${app.url}/profile/orders/${orderId}?payment=failed&reason=invalid_status`,
        { status: 303 },
      );
    }

    const isValid = await SSLCommerzService.validateIPN(
      tran_id,
      amount,
      currency,
    );

    if (!isValid) {
      return NextResponse.redirect(
        `${app.url}/profile/orders/${orderId}?payment=failed&reason=validation_failed`,
        { status: 303 },
      );
    }

    // Delegate DB operations to the service layer (calls process_payment_success RPC)
    const result = await EscrowService.processPaymentSuccess(
      orderId,
      tran_id,
      "SSLCOMMERZ",
    );

    if (!result.success) {
      return NextResponse.redirect(
        `${app.url}/profile/orders/${orderId}?payment=failed&reason=${result.error ?? "processing_error"}`,
        { status: 303 },
      );
    }

    // Redirect buyer to order page
    return NextResponse.redirect(
      `${app.url}/profile/orders/${orderId}?payment=success`,
      { status: 303 },
    );
  } catch (err) {
    console.error("[payment/success] Error:", err);
    return NextResponse.redirect(`${app.url}/profile/orders?payment=error`, {
      status: 303,
    });
  }
}
