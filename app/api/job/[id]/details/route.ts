import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { JobService } from "@/services/job.service";

// ─── GET /api/job/:id/details (owner or admin) ────────────────────
// Returns a single job with all non-deleted statuses visible.
// Does NOT increment the view counter.
// Used for the job edit page and other owner/admin views.
export const GET = withAuth({
  handler: async ({ params, user }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Job ID is required", statusCode: 400 });
      }

      // Pass the caller's profile ID — RPC handles owner vs public visibility
      const result = await JobService.getById(id, user.profile);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 404 });
      }

      return ok({ data: result.data });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
