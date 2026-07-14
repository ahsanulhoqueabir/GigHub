import { app } from "@/config/env.config";
import { getSupabaseServerClient } from "@/lib/api/supabase";
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
 * 3. Update escrow: payment_status → HOLDING, status → ACTIVE
 * 4. Update order: status → ACTIVE
 * 5. Create wallet_record: DEBIT for buyer (payment sent to escrow)
 * 6. Redirect buyer to order page (if browser request) or return JSON (if IPN)
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
        `${app.url}/orders?payment=failed&reason=missing_params`,
        { status: 303 },
      );
    }

    // Validate with SSLCommerz (only if status is VALID or VALIDATED)
    if (status !== "VALID" && status !== "VALIDATED") {
      return NextResponse.redirect(
        `${app.url}/orders/${orderId}?payment=failed&reason=invalid_status`,
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
        `${app.url}/orders/${orderId}?payment=failed&reason=validation_failed`,
        { status: 303 },
      );
    }

    // Get the Supabase admin client to bypass RLS for escrow update
    const supabase = getSupabaseServerClient();

    // Fetch escrow for this order
    const { data: escrowData, error: escrowError } = await supabase
      .from("escrow")
      .select("id, amount, sender")
      .eq("order", orderId)
      .single();

    if (escrowError || !escrowData) {
      return NextResponse.redirect(
        `${app.url}/orders/${orderId}?payment=failed&reason=escrow_not_found`,
        { status: 303 },
      );
    }

    // Fetch the buyer's wallet for the DEBIT record
    const { data: walletData } = await supabase
      .from("wallet")
      .select("id")
      .eq("user", escrowData.sender)
      .single();

    // Update escrow: HOLDING + transaction info
    await supabase
      .from("escrow")
      .update({
        payment_status: "HOLDING",
        payment_method: "SSLCOMMERZ",
        transaction_id: tran_id,
        status: "ACTIVE",
        updated_at: new Date().toISOString(),
      })
      .eq("order", orderId);

    // Update order: PENDING → ACTIVE
    await supabase
      .from("order")
      .update({
        status: "ACTIVE",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // Create wallet_record DEBIT for buyer (if wallet found)
    if (walletData?.id) {
      await supabase.from("wallet_record").insert({
        wallet: walletData.id,
        amount: escrowData.amount,
        type: "DEBIT",
        description: "Payment sent to escrow",
        order: orderId,
        escrow: escrowData.id,
        payment_method: "SSLCOMMERZ",
        payment_gateway: "SSLCOMMERZ",
        transaction_id: tran_id,
      });
    }

    // Redirect buyer to order page
    return NextResponse.redirect(
      `${app.url}/orders/${orderId}?payment=success`,
      { status: 303 },
    );
  } catch (err) {
    console.error("[payment/success] Error:", err);
    return NextResponse.redirect(`${app.url}/orders?payment=error`, {
      status: 303,
    });
  }
}
