import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { paginationParams } from "@/lib/pagination";
import type { WalletRecord } from "@/types/db/wallet-record.types";
import type { Wallet } from "@/types/db/wallet.types";
import type { ServiceResult } from "@/types/generic.types";
import type { PaginationOptions } from "@/types/pagination.types";

/**
 * WalletService — handles wallet and wallet record read operations.
 *
 * ## Key Operations
 *
 * - `getUserWallet`    — get a user's wallet (balance, currency, name)
 * - `getWalletRecords` — paginated transaction history for a wallet
 *
 * ## Notes
 *
 * - Wallet balance mutations (credit/debit) happen exclusively inside
 *   PostgreSQL RPC functions (`complete_order`, `resolve_dispute`) to
 *   guarantee atomicity. Do NOT update wallet balances directly here.
 * - RLS ensures users can only see their own wallet and records.
 */
export class WalletService {
  private static walletCollection = "wallet";
  private static recordCollection = "wallet_record";

  /**
   * Get the wallet for a specific user.
   *
   * Returns the wallet with balance, currency, and name.
   */
  static async getUserWallet(userId: string): Promise<ServiceResult<Wallet>> {
    try {
      const supabase = getSupabaseServerClient();

      const { data, error: sbError } = await supabase
        .from(this.walletCollection)
        .select("*")
        .eq("user", userId)
        .single();

      if (sbError) {
        return error("Wallet not found");
      }

      return success(data as unknown as Wallet);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get paginated wallet records (transaction history) for a wallet.
   *
   * Includes order and escrow references for context.
   */
  static async getWalletRecords(
    walletId: string,
    params: PaginationOptions & { type?: "CREDIT" | "DEBIT" },
  ): Promise<ServiceResult<{ items: WalletRecord[]; total: number }>> {
    try {
      const supabase = getSupabaseServerClient();
      const { limit, offset } = paginationParams(params);

      let query = supabase
        .from(this.recordCollection)
        .select(
          `
          *,
          order:order!wallet_record_order_fkey (
            id, code, title, status, source
          )
        `,
          { count: "exact", head: false },
        )
        .eq("wallet", walletId);

      if (params.type) {
        query = query.eq("type", params.type);
      }

      query = query
        .order("created_at", { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1);

      const { data, error: sbError, count } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success({
        items: (data as unknown as WalletRecord[]) ?? [],
        total: count ?? 0,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get wallet records for a user (resolves wallet first then fetches records).
   *
   * Convenience method used by the profile wallet page.
   */
  static async getUserWalletRecords(
    userId: string,
    params: PaginationOptions & { type?: "CREDIT" | "DEBIT" },
  ): Promise<
    ServiceResult<{
      wallet: Wallet;
      items: WalletRecord[];
      total: number;
    }>
  > {
    const walletResult = await WalletService.getUserWallet(userId);
    if (!walletResult.success) {
      return error(walletResult.error);
    }

    const wallet = walletResult.data;
    const recordsResult = await WalletService.getWalletRecords(
      wallet.id,
      params,
    );
    if (!recordsResult.success) {
      return error(recordsResult.error);
    }

    return success({
      wallet,
      items: recordsResult.data.items,
      total: recordsResult.data.total,
    });
  }
}
