import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import type { AdminDashboardData } from "@/types/admin-dashboard.types";
import type { ServiceResult } from "@/types/generic.types";

/**
 * AdminDashboardService — fetches aggregated dashboard data
 * via the `get_admin_dashboard_data` RPC function.
 */
export class AdminDashboardService {
  /**
   * Fetch all admin dashboard data in a single RPC call.
   */
  static async getDashboardData(): Promise<ServiceResult<AdminDashboardData>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "get_admin_dashboard_data",
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      return success(data as AdminDashboardData);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
