import { ok, fail } from "@/lib/api/api-response";
import { GeneralService } from "@/services/general.service";

// ─── GET /api/homepage (public) ───────────────────────────────────
// Returns homepage data (latest gigs, jobs, and tuitions) via the
// get_homepage_data RPC function.
export async function GET() {
  try {
    const result = await GeneralService.getHomepageData();

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
}
