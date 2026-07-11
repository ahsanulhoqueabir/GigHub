import { fail, ok } from "@/lib/api/api-response";
import { SiteDataService } from "@/services/site-data.service";

/**
 * GET /api/site-data
 * Returns all public site data (system config, hero banners, ad banners, announcements).
 * Used on site mount to populate global state.
 */
export const GET = async () => {
  try {
    const result = await SiteDataService.getPublicSiteData();

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    return ok({ data: result.data });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
};
