import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { generateOrderCode } from "@/lib/business/service.utils";
import { paginationParams } from "@/lib/pagination";
import type {
  CreateGigOrderInput,
  CreateJobOrderInput,
} from "@/lib/validations/order.schema";
import type { Order, OrderSource } from "@/types/db/order.types";
import type { ServiceResult } from "@/types/generic.types";
import type { PaginationOptions } from "@/types/pagination.types";

const MAX_CODE_RETRIES = 3;

/**
 * OrderService — handles all Order CRUD operations.
 *
 * ## Order Creation
 *
 * Order creation (both Gig and Job) is handled via PostgreSQL RPC functions
 * to guarantee **atomicity** — order, chat room, and (for Gig) escrow are
 * created inside a single database transaction. If any step fails, the
 * entire transaction is rolled back.
 *
 * ### Gig Order Flow
 * 1. Generate order code → call `create_gig_order` RPC
 * 2. RPC: fetch gig → validate → calculate pricing → create order →
 *    create chat room → create escrow → return order
 * 3. Retry on code collision (max 3 attempts)
 *
 * ### Job Order Flow
 * 1. Generate order code → call `create_job_order` RPC
 * 2. RPC: fetch proposal → validate → create order →
 *    create chat room (no escrow) → return order
 * 3. Retry on code collision (max 3 attempts)
 *
 * ## Status Transitions
 *
 * | Action | From → To        | Who           |
 * |--------|------------------|---------------|
 * | Accept | PENDING → ACTIVE | Buyer only    |
 * | Cancel | Any → CANCELLED  | Participant   |
 * | Delete | PENDING → (gone) | Participant   |
 *
 * ## Visibility
 *
 * Orders are visible only to participants (buyer/seller) and admins.
 * This is enforced by RLS (`order_select_participant` policy).
 */
export class OrderService {
  private static collection = "order";

  /**
   * Create a Gig order atomically.
   *
   * Calls the `create_gig_order` RPC which handles validation, pricing,
   * order creation, chat room creation, and escrow creation in a single
   * transaction.
   *
   * Retries up to 3 times if an order code collision occurs.
   */
  static async createGigOrder(
    buyerId: string,
    params: CreateGigOrderInput,
  ): Promise<ServiceResult<Order>> {
    for (let attempt = 0; attempt < MAX_CODE_RETRIES; attempt++) {
      const code = generateOrderCode("GIG");
      const result = await this.callCreateGigOrderRPC(code, buyerId, params);

      if (result.success) return result;

      // Only retry on code collision (unique constraint violation)
      if (
        !result.error?.toLowerCase().includes("duplicate") &&
        !result.error?.toLowerCase().includes("unique")
      ) {
        return result;
      }
    }

    return error("Failed to generate a unique order code. Please try again.");
  }

  /**
   * Internal: call the `create_gig_order` RPC.
   */
  private static async callCreateGigOrderRPC(
    code: string,
    buyerId: string,
    params: CreateGigOrderInput,
  ): Promise<ServiceResult<Order>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "create_gig_order",
        {
          p_code: code,
          p_buyer: buyerId,
          p_gig_id: params.gig,
          p_package_tier: params.package,
          p_deadline: params.deadline ?? null,
          p_description: params.description ?? null,
          p_note: params.note ?? null,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        data?: { order: Order };
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Failed to create gig order");
      }

      return success(result.data!.order);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Create a Job order from an approved proposal atomically.
   *
   * Calls the `create_job_order` RPC which handles validation, order
   * creation, and chat room creation in a single transaction.
   * No escrow is created for job orders.
   *
   * Retries up to 3 times if an order code collision occurs.
   */
  static async createJobOrder(
    params: CreateJobOrderInput,
  ): Promise<ServiceResult<Order>> {
    for (let attempt = 0; attempt < MAX_CODE_RETRIES; attempt++) {
      const code = generateOrderCode("JOB");
      const result = await this.callCreateJobOrderRPC(code, params);

      if (result.success) return result;

      // Only retry on code collision (unique constraint violation)
      if (
        !result.error?.toLowerCase().includes("duplicate") &&
        !result.error?.toLowerCase().includes("unique")
      ) {
        return result;
      }
    }

    return error("Failed to generate a unique order code. Please try again.");
  }

  /**
   * Internal: call the `create_job_order` RPC.
   */
  private static async callCreateJobOrderRPC(
    code: string,
    params: CreateJobOrderInput,
  ): Promise<ServiceResult<Order>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "create_job_order",
        {
          p_code: code,
          p_proposal_id: params.proposal,
          p_note: params.note ?? null,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        data?: { order: Order };
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Failed to create job order");
      }

      return success(result.data!.order);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get paginated list of orders.
   *
   * Visibility is enforced by RLS (`order_select_participant`) — only
   * participants (buyer/seller) and admins can see orders.
   *
   * Supports filtering by status, source (GIG/JOB), buyer, seller,
   * and search term. Supports sorting by created_at, total_price,
   * and status.
   */
  static async list(
    params: PaginationOptions & {
      status?: string;
      source?: OrderSource;
      buyer?: string;
      seller?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ): Promise<ServiceResult<{ items: Order[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);
      const {
        status,
        source,
        buyer,
        seller,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
      } = params;

      let query = supabase.from(this.collection).select(
        `
          *,
          buyer:profile!order_buyer_fkey (
            id, name, username, avatar
          ),
          seller:profile!order_seller_fkey (
            id, name, username, avatar
          )
        `,
        { count: "exact", head: false },
      );

      // Optional status filter
      if (status) {
        query = query.eq("status", status);
      }

      // Optional source filter (GIG / JOB)
      if (source) {
        query = query.eq("source", source);
      }

      // Optional buyer filter
      if (buyer) {
        query = query.eq("buyer", buyer);
      }

      // Optional seller filter
      if (seller) {
        query = query.eq("seller", seller);
      }

      // Optional search filter (order code or title)
      if (search) {
        query = query.or(`code.ilike.%${search}%,title.ilike.%${search}%`);
      }

      // Apply sorting — whitelist allowed sort fields
      const allowedSortFields = [
        "created_at",
        "updated_at",
        "total_price",
        "status",
      ];
      const actualSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : "created_at";

      query = query.order(actualSortBy, {
        ascending: sortOrder === "asc",
        nullsFirst: false,
      });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as unknown as Order[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get a single order by ID.
   *
   * Visibility is enforced by RLS — participants (buyer/seller) and
   * admins can access the order.
   */
  static async getById(id: string): Promise<ServiceResult<Order>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select(
          `
          *,
          buyer:profile!order_buyer_fkey (
            id, name, username, avatar
          ),
          seller:profile!order_seller_fkey (
            id, name, username, avatar
          )
        `,
        )
        .eq("id", id)
        .single();

      if (sbError) {
        // RLS will cause "not found" for non-participants
        return error("Order not found");
      }

      return success(data as unknown as Order);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Accept a PENDING order (buyer only).
   *
   * Calls the `accept_order` RPC which validates:
   * - Order exists
   * - Caller is the buyer
   * - Current status is PENDING
   */
  static async accept(
    orderId: string,
    callerProfileId: string,
  ): Promise<ServiceResult<{ order_id: string }>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "accept_order",
        {
          p_order_id: orderId,
          p_caller_profile_id: callerProfileId,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        order_id?: string;
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Cannot accept order");
      }

      return success({ order_id: result.order_id! });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Cancel an order (buyer or seller).
   *
   * Calls the `cancel_order` RPC which validates:
   * - Order exists
   * - Order is not already CANCELLED
   * - Caller is a participant (buyer or seller)
   */
  static async cancel(
    orderId: string,
    callerProfileId: string,
    reason: string,
  ): Promise<ServiceResult<{ order_id: string }>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "cancel_order",
        {
          p_order_id: orderId,
          p_caller_profile_id: callerProfileId,
          p_reason: reason,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        order_id?: string;
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Cannot cancel order");
      }

      return success({ order_id: result.order_id! });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Delete a PENDING order permanently.
   *
   * Calls the `delete_order` RPC which validates:
   * - Order exists
   * - Status is PENDING
   * - Caller is a participant (buyer, seller) or admin
   *
   * Uses hard DELETE (not soft-delete). Dependent records
   * (chat_room, escrow) are cleaned up via ON DELETE CASCADE.
   */
  static async delete(
    orderId: string,
    callerProfileId: string,
    callerRole: string,
  ): Promise<ServiceResult<{ deleted_id: string }>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "delete_order",
        {
          p_order_id: orderId,
          p_caller_profile_id: callerProfileId,
          p_caller_role: callerRole,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        deleted_id?: string;
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Cannot delete order");
      }

      return success({ deleted_id: result.deleted_id! });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
