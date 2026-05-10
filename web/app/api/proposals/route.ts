import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { ProposalService } from "@/services/proposal.service";
import { JobService } from "@/services/job.service";
import type { JwtPayload } from "@/types/business/user.types";

/**
 * POST /api/proposals - Submit a new proposal for a job
 */
export const POST = withAuth(
  async (req: NextRequest, jwtPayload: JwtPayload) => {
    try {
      const body = await req.json();
      const { job_id, cover_letter, quoted_price, estimated_days } = body;

      if (
        !job_id ||
        !cover_letter ||
        quoted_price === undefined ||
        !estimated_days
      ) {
        return fail({
          error:
            "job_id, cover_letter, quoted_price, and estimated_days are required",
        });
      }

      // Verify job exists
      const jobResult = await JobService.getById(job_id);
      if (!jobResult.success) {
        return fail({ error: "Job not found", statusCode: 404 });
      }

      // Prevent applying to own job
      const posterId =
        typeof jobResult.data.poster === "string"
          ? jobResult.data.poster
          : (jobResult.data.poster as { id: string }).id;

      if (posterId === jwtPayload.profile) {
        return fail({
          error: "You cannot apply to your own job",
          statusCode: 403,
        });
      }

      const result = await ProposalService.create({
        job_id,
        applicant: jwtPayload.profile,
        cover_letter,
        quoted_price,
        estimated_days,
      });

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({ data: result.data, statusCode: 201 });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
);

/**
 * GET /api/proposals - Not implemented; use /api/proposals/me or /api/proposals/job/:jobId
 */
export async function GET() {
  return fail({
    error: "Use /api/proposals/me or /api/proposals/job/:jobId",
    statusCode: 400,
  });
}
