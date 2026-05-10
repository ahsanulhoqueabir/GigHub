import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { ProposalService } from "@/services/proposal.service";
import { JobService } from "@/services/job.service";
import type { JwtPayload } from "@/types/business/user.types";

type RouteContext = { params: Promise<{ jobId: string }> };

/**
 * GET /api/proposals/job/[jobId] - List proposals for a specific job
 */
export const GET = withAuth<RouteContext>(
  async (_req: NextRequest, jwtPayload: JwtPayload, context: RouteContext) => {
    try {
      const { jobId } = await context.params;

      // Verify job exists
      const jobResult = await JobService.getById(jobId);
      if (!jobResult.success) {
        return fail({ error: "Job not found", statusCode: 404 });
      }

      // Only job poster can view proposals
      const posterId =
        typeof jobResult.data.poster === "string"
          ? jobResult.data.poster
          : (jobResult.data.poster as { id: string }).id;

      if (posterId !== jwtPayload.profile) {
        return fail({
          error: "You are not allowed to view proposals for this job",
          statusCode: 403,
        });
      }

      const result = await ProposalService.listByJob(jobId);

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
  },
);
