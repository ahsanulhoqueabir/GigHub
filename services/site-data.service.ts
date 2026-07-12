import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import type { AdBanner } from "@/types/db/ad-banner.types";
import type { Announcement } from "@/types/db/announcement.types";
import type { HeroBanner } from "@/types/db/hero-banner.types";
import type { SystemConfig } from "@/types/db/system-config.types";
import type { ServiceResult } from "@/types/generic.types";

export interface PublicSiteData {
  system_config: SystemConfig | null;
  hero_banners: HeroBanner[];
  ad_banners: AdBanner[];
  announcements: Announcement[];
}

/**
 * Service for fetching public site-wide data via RPC.
 * Used on site mount to populate global state.
 */
export class SiteDataService {
  /**
   * Fetch all public site data in a single RPC call.
   * Returns system_config, active hero_banners, active ad_banners, active announcements.
   */
  static async getPublicSiteData(): Promise<ServiceResult<PublicSiteData>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "get_public_site_data",
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      return success(data as PublicSiteData);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
