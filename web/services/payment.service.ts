import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import type { Transaction } from "@/types/db/transaction.types";
import type { Escrow } from "@/types/db/escrow.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export class PaymentService {
  /**
   * Get user balance from profiles table.
   */
  static async getBalance(
    profileId: string,
  ): Promise<ServiceResult<{ balance: number; currency: string }>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from("profiles")
        .select("total_earnings")
        .eq("id", profileId)
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        balance: data?.total_earnings ?? 0,
        currency: "BDT",
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get user transactions with pagination.
   */
  static async getTransactions(
    profileId: string,
    page = 1,
    limit = 10,
  ): Promise<ServiceResult<{ transactions: Transaction[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const {
        data,
        error: sbError,
        count,
      } = await (supabase as any)
        .from("transactions")
        .select("*, order:orders(id, order_number, title)", { count: "exact" })
        .eq("profile", profileId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        transactions: (data as Transaction[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get escrow detail for an order.
   */
  static async getEscrowByOrder(
    orderId: string,
    profileId: string,
  ): Promise<ServiceResult<Escrow>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from("escrow")
        .select(
          "*, order:orders!escrow_order_fkey(id, order_number, title, amount), buyer:profiles!escrow_buyer_fkey(id, name, username), seller:profiles!escrow_seller_fkey(id, name, username)",
        )
        .eq("order", orderId)
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Escrow not found");
      }

      // Only buyer or seller can view
      const escrow = data as Escrow;
      const buyerId =
        typeof escrow.buyer === "string"
          ? escrow.buyer
          : (escrow.buyer as { id: string }).id;
      const sellerId =
        typeof escrow.seller === "string"
          ? escrow.seller
          : (escrow.seller as { id: string }).id;

      if (buyerId !== profileId && sellerId !== profileId) {
        return error("You are not allowed to view this escrow");
      }

      return success(escrow);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Initiate payment for an order via SSLCommerz.
   */
  static async initiatePayment(
    orderId: string,
    profileId: string,
  ): Promise<
    ServiceResult<{
      tran_id: string;
      gateway_page_url: string;
      fees: { platform_fee: number; total_charges: number };
    }>
  > {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: orderData, error: orderError } = await (supabase as any)
        .from("orders")
        .select("*, buyer:profiles!orders_buyer_fkey(id, name, email)")
        .eq("id", orderId)
        .single();

      if (orderError || !orderData) {
        return error("Order not found");
      }

      const order = orderData;
      const buyerId =
        typeof order.buyer === "string" ? order.buyer : order.buyer.id;

      if (buyerId !== profileId) {
        return error("You are not allowed to initiate payment for this order");
      }

      if (order.status !== "pending") {
        return error("Order is not in pending status");
      }

      const tranId = `GH-PAY-${Date.now()}-${orderId.substring(0, 8)}`;
      const platformFee = order.platform_fee || 0;
      const totalCharges = order.amount + platformFee;

      // Create a transaction record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profileData } = await (supabase as any)
        .from("profiles")
        .select("total_earnings")
        .eq("id", profileId)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("transactions").insert({
        profile: profileId,
        order: orderId,
        type: "payment",
        amount: totalCharges,
        direction: "debit",
        balance_after: profileData?.total_earnings ?? 0,
        description: `Payment for order #${order.order_number}`,
        payment_method: "sslcommerz",
        payment_reference: tranId,
        status: "pending",
      });

      // Create escrow record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("escrow").upsert(
        {
          order: orderId,
          buyer: buyerId,
          seller: order.seller,
          amount: order.amount,
          platform_fee: platformFee,
          status: "held",
          auto_release_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        { onConflict: "order" },
      );

      // In production, this would call the SSLCommerz API
      const gatewayPageUrl = `https://sandbox.sslcommerz.com/gwprocess/v4/buy?tran_id=${tranId}`;

      return success({
        tran_id: tranId,
        gateway_page_url: gatewayPageUrl,
        fees: {
          platform_fee: platformFee,
          total_charges: totalCharges,
        },
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Handle SSLCommerz payment status update (success/fail/cancel/IPN).
   */
  static async handlePaymentStatus(
    orderId: string,
    tranId: string,
    status: "processing" | "pending" | "cancelled",
  ): Promise<
    ServiceResult<{
      id: string;
      order_number: string;
      status: string;
    }>
  > {
    try {
      const supabase = getSupabaseServerClient();

      // Update transaction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("transactions")
        .update({
          status:
            status === "processing"
              ? "completed"
              : status === "cancelled"
                ? "failed"
                : "pending",
        })
        .eq("payment_reference", tranId);

      // Update order status
      const orderStatus =
        status === "processing"
          ? "active"
          : status === "cancelled"
            ? "cancelled"
            : "pending";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: orderData, error: orderError } = await (supabase as any)
        .from("orders")
        .update({
          status: orderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select("id, order_number, status")
        .single();

      if (orderError) {
        return error(orderError.message);
      }

      // Update escrow if payment successful
      if (status === "processing") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("escrow")
          .update({ status: "held" })
          .eq("order", orderId);
      }

      return success({
        id: orderData.id,
        order_number: orderData.order_number,
        status: orderData.status,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
