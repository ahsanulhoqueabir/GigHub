import { app, sslcmz } from "@/config/env.config";

// ─── SSLCommerz Types ──────────────────────────────────────────────────

export interface SSLCommerzInitPayload {
  total_amount: number;
  currency: string; // "BDT"
  tran_id: string; // unique transaction ID
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
  cus_add1?: string;
  cus_city?: string;
  cus_country?: string;
  ship_name?: string;
  ship_add1?: string;
  ship_city?: string;
  ship_country?: string;
  product_name?: string;
  product_category?: string;
  product_profile?: string;
  multi_card_name?: string;
  value_a?: string; // custom field — we use for order_id
  value_b?: string;
}

export interface SSLCommerzResponse {
  status: string; // "SUCCESS" | "FAILED" | "INVALID_REQUEST"
  failedreason?: string;
  GatewayPageURL?: string; // redirect URL on SUCCESS
  sessionkey?: string;
  tran_id?: string;
  amount?: string;
  currency?: string;
}

export interface SSLCommerzIPN {
  status: string; // "VALID" | "VALIDATED" | "FAILED" | "CANCELLED"
  tran_id: string;
  amount: string;
  currency: string;
  card_type?: string;
  store_amount?: string;
  bank_tran_id?: string;
  tran_date?: string;
  error?: string;
  currency_amount?: string;
  currency_type?: string;
  val_id?: string;
  value_a?: string; // order_id
  value_b?: string;
  verify_sign?: string;
  verify_key?: string;
  verify_sign_sha2?: string;
  [key: string]: string | undefined;
}

export interface SSLCommerzValidationResponse {
  status: string; // "VALID" | "VALIDATED" | "INVALID_TRANSACTION" | "FAILED"
  tran_id?: string;
  amount?: string;
  currency?: string;
  card_type?: string;
  error?: string;
  [key: string]: string | undefined;
}

// ─── SSLCommerz Service ────────────────────────────────────────────────

/**
 * SSLCommerzService — wrapper around the SSLCommerz payment gateway.
 *
 * ## Usage
 *
 * ### Initiate a payment
 * ```ts
 * const result = await SSLCommerzService.initiatePayment({ ... });
 * if (result.status === "SUCCESS") {
 *   // redirect buyer to result.GatewayPageURL
 * }
 * ```
 *
 * ### Validate IPN
 * ```ts
 * const isValid = await SSLCommerzService.validateIPN(tranId, amount, currency);
 * ```
 *
 * ### Query transaction
 * ```ts
 * const tx = await SSLCommerzService.queryTransaction(tranId);
 * ```
 */
export class SSLCommerzService {
  private static get isLive(): boolean {
    return sslcmz.status === "true";
  }

  private static get baseUrl(): string {
    return SSLCommerzService.isLive
      ? "https://securepay.sslcommerz.com"
      : "https://sandbox.sslcommerz.com";
  }

  private static get storeId(): string {
    return sslcmz.store;
  }

  private static get storePassword(): string {
    return sslcmz.password;
  }

  /**
   * Initiate a payment session with SSLCommerz.
   *
   * Sends a POST request to the SSLCommerz initiation endpoint and
   * returns the response which contains the `GatewayPageURL` to
   * redirect the buyer to.
   */
  static async initiatePayment(
    payload: SSLCommerzInitPayload,
  ): Promise<SSLCommerzResponse> {
    const params = new URLSearchParams({
      store_id: SSLCommerzService.storeId,
      store_passwd: SSLCommerzService.storePassword,
      total_amount: String(payload.total_amount),
      currency: payload.currency,
      tran_id: payload.tran_id,
      success_url: payload.success_url,
      fail_url: payload.fail_url,
      cancel_url: payload.cancel_url,
      ipn_url: payload.ipn_url,
      cus_name: payload.cus_name,
      cus_email: payload.cus_email,
      cus_phone: payload.cus_phone,
      cus_add1: payload.cus_add1 ?? "N/A",
      cus_city: payload.cus_city ?? "Dhaka",
      cus_country: payload.cus_country ?? "Bangladesh",
      ship_name: payload.ship_name ?? payload.cus_name,
      ship_add1: payload.ship_add1 ?? "N/A",
      ship_city: payload.ship_city ?? "Dhaka",
      ship_country: payload.ship_country ?? "Bangladesh",
      product_name: payload.product_name ?? "Gig Service",
      product_category: payload.product_category ?? "Service",
      product_profile: payload.product_profile ?? "general",
      ...(payload.value_a ? { value_a: payload.value_a } : {}),
      ...(payload.value_b ? { value_b: payload.value_b } : {}),
    });

    const response = await fetch(
      `${SSLCommerzService.baseUrl}/gwprocess/v4/api.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      },
    );

    if (!response.ok) {
      return {
        status: "FAILED",
        failedreason: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as SSLCommerzResponse;
    return data;
  }

  /**
   * Validate an IPN (Instant Payment Notification) by querying SSLCommerz
   * for the transaction status.
   *
   * Returns true if the transaction is VALID or VALIDATED.
   */
  static async validateIPN(
    tranId: string,
    amount: string,
    currency: string,
  ): Promise<boolean> {
    try {
      const result = await SSLCommerzService.queryTransaction(tranId);

      if (result.status !== "VALID" && result.status !== "VALIDATED") {
        return false;
      }

      // Verify amount matches (within 1 taka tolerance for floating point)
      const returnedAmount = parseFloat(result.amount ?? "0");
      const expectedAmount = parseFloat(amount);
      if (Math.abs(returnedAmount - expectedAmount) > 1) {
        return false;
      }

      // Verify currency
      if (result.currency && result.currency !== currency) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Query transaction status from SSLCommerz.
   *
   * Uses the order/transaction validation API to get the current
   * status of a transaction by its transaction ID.
   */
  static async queryTransaction(
    tranId: string,
  ): Promise<SSLCommerzValidationResponse> {
    const params = new URLSearchParams({
      store_id: SSLCommerzService.storeId,
      store_passwd: SSLCommerzService.storePassword,
      tran_id: tranId,
      format: "json",
    });

    const response = await fetch(
      `${SSLCommerzService.baseUrl}/validator/api/merchantTransIDvalidationAPI.php?${params.toString()}`,
      { method: "GET" },
    );

    if (!response.ok) {
      return {
        status: "FAILED",
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (
      data &&
      data.element &&
      Array.isArray(data.element) &&
      data.element.length > 0
    ) {
      return data.element[0] as SSLCommerzValidationResponse;
    }

    if (data && data.status) {
      return data as SSLCommerzValidationResponse;
    }

    return {
      status: "FAILED",
      error: "Transaction not found or invalid response format",
    };
  }

  /**
   * Build the standard callback URLs for SSLCommerz.
   *
   * @param orderId - The order ID to embed as a path segment
   */
  static buildCallbackUrls(orderId: string): {
    success_url: string;
    fail_url: string;
    cancel_url: string;
    ipn_url: string;
  } {
    const base = app.url;
    return {
      success_url: `${base}/api/payment/success`,
      fail_url: `${base}/api/payment/fail`,
      cancel_url: `${base}/api/payment/cancel`,
      ipn_url: `${base}/api/payment/success`,
    };
  }
}
