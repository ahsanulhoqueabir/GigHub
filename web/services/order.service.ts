import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import type { Order, OrderStatus } from "@/types/db/order.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CreateOrderParams {
  buyer: string;
  gig_id: string;
  gig_package_tier: string;
  amount: number;
  proposal_id?: string;
}

export interface UpdateOrderParams {
  status?: string;
  cancellation_reason?: string;
}

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${randomPart}`;
}

export class OrderService {
  private static collection = "orders";
  private static platformFeePercent = 5; // Default 5%

  /**
   * Create a new order from a gig purchase.
   */
  static async create(
    params: CreateOrderParams,
  ): Promise<ServiceResult<Order>> {
    try {
      const supabase = getSupabaseServerClient();

      // Fetch the gig to get package details and seller info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: gigData, error: gigError } = await (supabase as any)
        .from("gigs")
        .select("*")
        .eq("id", params.gig_id)
        .single();

      if (gigError || !gigData) {
        return error("Gig not found");
      }

      const gig = gigData as import("@/types/db/gig.types").Gig;
      const sellerId =
        typeof gig.seller === "string" ? gig.seller : gig.seller.id;

      // Find the selected package
      const selectedPackage = (gig.packages || []).find(
        (pkg: { tier: string }) => pkg.tier === params.gig_package_tier,
      );

      if (!selectedPackage) {
        return error("Selected package tier not found in gig");
      }

      const platformFee =
        Math.round(params.amount * (this.platformFeePercent / 100) * 100) / 100;
      const sellerEarnings =
        Math.round((params.amount - platformFee) * 100) / 100;
      const orderNumber = generateOrderNumber();

      const deliveryDeadline = new Date();
      deliveryDeadline.setDate(
        deliveryDeadline.getDate() + selectedPackage.delivery_days,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .insert({
          order_number: orderNumber,
          buyer: params.buyer,
          seller: sellerId,
          source_type: "gig",
          gig: params.gig_id,
          tier: params.gig_package_tier,
          job: null,
          proposal: params.proposal_id ?? null,
          title: gig.title,
          description: gig.description,
          amount: params.amount,
          platform_fee: platformFee,
          seller_earnings: sellerEarnings,
          delivery_days: selectedPackage.delivery_days,
          revision_count: selectedPackage.revision_count,
          revisions_used: 0,
          status: "pending",
          delivery_deadline: deliveryDeadline.toISOString(),
        })
        .select(
          "*, buyer:profiles!orders_buyer_fkey(id, name, username, email, avatar), seller:profiles!orders_seller_fkey(id, name, username, email, avatar), gig:gigs!orders_gig_fkey(id, title, description, packages)",
        )
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as Order);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get order by ID.
   */
  static async getById(id: string): Promise<ServiceResult<Order>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .select(
          "*, buyer:profiles!orders_buyer_fkey(id, name, username, email, avatar), seller:profiles!orders_seller_fkey(id, name, username, email, avatar), gig:gigs!orders_gig_fkey(id, title, description, packages)",
        )
        .eq("id", id)
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Order not found");
      }

      return success(data as Order);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * List orders for a user (as buyer or seller).
   */
  static async listByUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<ServiceResult<{ orders: Order[]; total: number }>> {
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
        .from(this.collection)
        .select(
          "*, buyer:profiles!orders_buyer_fkey(id, name, username, email, avatar), seller:profiles!orders_seller_fkey(id, name, username, email, avatar), gig:gigs!orders_gig_fkey(id, title)",
          { count: "exact" },
        )
        .or(`buyer.eq.${userId},seller.eq.${userId}`)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (sbError) {
        return error(sbError.message);
      }

      return success({ orders: (data as Order[]) ?? [], total: count ?? 0 });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update order status.
   */
  static async updateStatus(
    id: string,
    params: UpdateOrderParams,
  ): Promise<ServiceResult<Order>> {
    try {
      const supabase = getSupabaseServerClient();
      const now = new Date().toISOString();

      const updateData: Record<string, unknown> = {
        status: params.status,
        updated_at: now,
      };

      if (params.status === "cancelled") {
        updateData.cancelled_at = now;
        if (params.cancellation_reason) {
          updateData.cancellation_reason = params.cancellation_reason;
        }
      }

      if (params.status === "completed") {
        updateData.completed_at = now;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .update(updateData)
        .eq("id", id)
        .select(
          "*, buyer:profiles!orders_buyer_fkey(id, name, username), seller:profiles!orders_seller_fkey(id, name, username), gig:gigs!orders_gig_fkey(id, title)",
        )
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Order not found");
      }

      return success(data as Order);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
