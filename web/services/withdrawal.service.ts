import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import type { Withdrawal } from "@/types/db/withdrawal.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CreateWithdrawalParams {
  profile: string;
  amount: number;
  method: string;
  account_info: string;
}

export class WithdrawalService {
  private static collection = "withdrawals";

  /**
   * Create a withdrawal request.
   */
  static async create(
    params: CreateWithdrawalParams,
  ): Promise<ServiceResult<Withdrawal>> {
    try {
      const supabase = getSupabaseServerClient();

      // Check minimum withdrawal amount (500 BDT)
      if (params.amount < 500) {
        return error("Minimum withdrawal amount is 500 BDT");
      }

      // Check user balance
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profileData } = await (supabase as any)
        .from("profiles")
        .select("total_earnings")
        .eq("id", params.profile)
        .single();

      const balance = profileData?.total_earnings ?? 0;
      if (balance < params.amount) {
        return error("Insufficient balance");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .insert({
          profile: params.profile,
          amount: params.amount,
          method: params.method,
          account_details: { account_info: params.account_info },
          status: "pending",
        })
        .select(
          "*, profile:profiles!withdrawals_profile_fkey(id, name, username)",
        )
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as Withdrawal);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
