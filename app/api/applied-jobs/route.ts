import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { JobProposalService } from "@/services/job-proposal.service";
import { parsePagination } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";

// ─── GET /api/applied-jobs (protected) ────────────────────────────────────
// Returns paginated list of the caller's own applied jobs.
//
// Query parameters:
//   page, limit  — pagination
export const GET = withAuth({
  handler: async ({ req, user }) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const { page, limit } = parsePagination(searchParams);

      const result = await JobProposalService.getAppliedJobs(user.profile, {
        page,
        limit,
      });

      if (!result.success) {
        return fail({ error: result.error, statusCode: 500 });
      }

      const pagination = paginationMeta({
        page,
        limit,
        totalItems: result.data.total,
      });

      return ok({
        data: {
          items: result.data.items,
          pagination,
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
