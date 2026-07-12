import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import { GigListItem } from "@/types/db/gig.types";
import { JobListItem } from "@/types/db/job.types";
import type { ServiceResult } from "@/types/generic.types";

export interface HomepageData {
  gigs: GigListItem[];
  jobs: JobListItem[];
  tuitions: JobListItem[];
}

/**
 * GeneralService — handles general/homepage data operations.
 */
export class GeneralService {
  /**
   * Fetch homepage data (latest gigs, jobs, tuitions) via the
   * `get_homepage_data` RPC function.
   */
  static async getHomepageData(): Promise<ServiceResult<HomepageData>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "get_homepage_data",
        {
          p_gig_limit: 8,
          p_job_limit: 6,
          p_tuition_limit: 6,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      return success(data as HomepageData);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
