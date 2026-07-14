import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { paginationParams } from "@/lib/pagination";
import type { Escrow } from "@/types/db/escrow.types";
import type { ServiceResult } from "@/types/generic.types";
import type { PaginationOptions } from "@/types/pagination.types";

/**
 * EscrowService — handles escrow read operations and dispute workflows.
 *
 * ## Key Operations
 *
 * - `getByOrderId`       — fetch the escrow record for a specific order
 * - `getUserEscrows`     — paginated list of all escrows for a user (sender or receiver)
 * - `getDisputedEscrows` — admin: list all escrows in REVIEW status
 * - `requestDispute`     — seller raises a dispute on a DELIVERED order (calls RPC)
 * - `resolveDispute`     — admin resolves a dispute (calls RPC)
 *
 * ## Notes
 *
 * - All wallet mutations happen inside PostgreSQL RPCs (`request_dispute`,
 *   `resolve_dispute`) to guarantee atomicity.
 * - RLS ensures users can only see their own escrow records.
 */
export class EscrowService {
  private static collection = "escrow";

  /**
   * Get the escrow record for a specific order.
   *
   * Includes sender and receiver profile info.
   */
  static async getByOrderId(orderId: string): Promise<ServiceResult<Escrow>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.collection)
        .select(
          `
          *,
          sender:profile!escrow_sender_fkey (
            id, name, username, avatar
          ),
          receiver:profile!escrow_receiver_fkey (
            id, name, username, avatar
          ),
          resolved_by:profile!escrow_resolved_by_fkey (
            id, name, username, avatar
          )
        `,
        )
        .eq("order", orderId)
        .single();

      if (sbError) {
        return error("Escrow not found");
      }

      return success(data as unknown as Escrow);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get paginated escrow records for a user (as sender or receiver).
   */
  static async getUserEscrows(
    userId: string,
    params: PaginationOptions,
  ): Promise<ServiceResult<{ items: Escrow[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);

      const {
        data,
        error: sbError,
        count,
      } = await supabase
        .from(this.collection)
        .select(
          `
          *,
          sender:profile!escrow_sender_fkey (
            id, name, username, avatar
          ),
          receiver:profile!escrow_receiver_fkey (
            id, name, username, avatar
          ),
          order:order!escrow_order_fkey (
            id, code, title, status, source
          )
        `,
          { count: "exact", head: false },
        )
        .or(`sender.eq.${userId},receiver.eq.${userId}`)
        .order("created_at", { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1);

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as unknown as Escrow[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Admin: get paginated list of all escrows with optional status filter.
   */
  static async listAll(
    params: PaginationOptions & { status?: string; search?: string },
  ): Promise<ServiceResult<{ items: Escrow[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);

      let query = supabase.from(this.collection).select(
        `
          *,
          sender:profile!escrow_sender_fkey (
            id, name, username, avatar
          ),
          receiver:profile!escrow_receiver_fkey (
            id, name, username, avatar
          ),
          order:order!escrow_order_fkey (
            id, code, title, status, source
          )
        `,
        { count: "exact", head: false },
      );

      if (params.status) {
        query = query.eq("status", params.status);
      }

      if (params.search) {
        query = query.ilike("transaction_id", `%${params.search}%`);
      }

      query = query
        .order("created_at", { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as unknown as Escrow[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Admin: get paginated list of escrows in REVIEW (disputed) status.
   */
  static async getDisputedEscrows(
    params: PaginationOptions,
  ): Promise<ServiceResult<{ items: Escrow[]; total: number }>> {
    return EscrowService.listAll({ ...params, status: "REVIEW" });
  }

  /**
   * Seller requests a dispute on a DELIVERED order.
   *
   * Calls the `request_dispute` PostgreSQL RPC which atomically:
   * 1. Validates caller is seller & order is DELIVERED
   * 2. Updates order status → REVIEW
   * 3. Updates escrow status → REVIEW with dispute details
   */
  static async requestDispute(
    orderId: string,
    sellerProfileId: string,
    reason: string,
  ): Promise<ServiceResult<{ order_id: string }>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "request_dispute",
        {
          p_order_id: orderId,
          p_caller_profile_id: sellerProfileId,
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
        return error(result.error ?? "Cannot request dispute");
      }

      return success({ order_id: result.order_id! });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Admin resolves a dispute.
   *
   * Calls the `resolve_dispute` PostgreSQL RPC which atomically:
   * - RELEASE: credits seller wallet, marks escrow COMPLETED, order COMPLETED
   * - REFUND: credits buyer wallet, marks escrow CANCELLED, order CANCELLED
   */
  static async resolveDispute(
    orderId: string,
    adminProfileId: string,
    resolution: "RELEASE" | "REFUND",
    adminNote?: string,
  ): Promise<ServiceResult<{ order_id: string; resolution: string }>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "resolve_dispute",
        {
          p_order_id: orderId,
          p_admin_id: adminProfileId,
          p_resolution: resolution,
          p_admin_note: adminNote ?? null,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as {
        success: boolean;
        order_id?: string;
        resolution?: string;
        error?: string;
      };

      if (!result.success) {
        return error(result.error ?? "Cannot resolve dispute");
      }

      return success({
        order_id: result.order_id!,
        resolution: result.resolution!,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
