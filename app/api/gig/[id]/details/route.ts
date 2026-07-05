import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { GigService } from "@/services/gig.service";

// ─── GET /api/gig/:id/details (seller or admin) ───────────────────
// Returns a single gig with all non-deleted statuses visible.
// Does NOT increment the view counter.
// Used for the gig edit page and other owner/admin views.
export const GET = withAuth({
  handler: async ({ params, user }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Gig ID is required", statusCode: 400 });
      }

      // Pass the caller's profile ID — RPC handles owner vs public visibility
      const result = await GigService.getById(id, user.profile);

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
