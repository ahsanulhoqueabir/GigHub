import { NextRequest } from "next/server";
import { ok, fail, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { JobProposalService } from "@/services/job-proposal.service";
import { createJobProposalSchema } from "@/lib/validations/job-proposal.schema";
import { parsePagination } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";

// ─── GET /api/job-proposal (public) ───────────────────────────────
// Returns paginated list of job proposals.
//
// Query parameters:
//   page, limit          — pagination
//   job                  — filter by job UUID
//   applicant            — filter by applicant UUID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(searchParams);

    const job = searchParams.get("job") || undefined;
    const applicant = searchParams.get("applicant") || undefined;

    const result = await JobProposalService.list({
      page,
      limit,
      job,
      applicant,
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
}

// ─── POST /api/job-proposal (authenticated user) ──────────────────
// Creates a new job proposal. Applicant is extracted from JWT.
export const POST = withAuth({
  handler: async ({ req, user }) => {
    try {
      const payload = await parseBody(req, createJobProposalSchema);
      if (payload instanceof Response) return payload;

      const result = await JobProposalService.create(user.profile, payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Job proposal submitted successfully",
        statusCode: 201,
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
