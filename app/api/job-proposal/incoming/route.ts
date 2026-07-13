import { fail, ok } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { parsePagination } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";
import { JobProposalService } from "@/services/job-proposal.service";

// ─── GET /api/job-proposal/incoming (authenticated) ───────────────
// Returns paginated list of proposals for jobs owned by the caller.
export const GET = withAuth({
  handler: async ({ req, user }) => {
    try {
      const { page, limit } = parsePagination(req.nextUrl.searchParams);
      const job = req.nextUrl.searchParams.get("job") ?? undefined;

      const result = await JobProposalService.getIncomingProposals(
        user.profile,
        { page, limit, job },
      );

      if (!result.success) {
        return fail({ error: result.error, statusCode: 500 });
      }

      const meta = paginationMeta({
        page,
        limit,
        totalItems: result.data.total,
      });

      return ok({
        data: {
          items: result.data.items,
          pagination: meta,
        },
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
