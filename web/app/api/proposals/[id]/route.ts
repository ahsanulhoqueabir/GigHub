import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { ProposalService } from "@/services/proposal.service";
import type { JwtPayload } from "@/types/business/user.types";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/proposals/[id] - Get proposal detail
 */
export const GET = withAuth<RouteContext>(
  async (_req: NextRequest, jwtPayload: JwtPayload, context: RouteContext) => {
    try {
      const { id } = await context.params;

      const result = await ProposalService.getById(id);

      if (!result.success) {
        return fail({ error: "Proposal not found", statusCode: 404 });
      }

      const proposal = result.data;
      const applicantId =
        typeof proposal.applicant === "string"
          ? proposal.applicant
          : (proposal.applicant as { id: string }).id;
      const jobPosterId =
        typeof proposal.job === "string"
          ? null
          : (proposal.job as { poster?: string })?.poster;

      // Only applicant or job poster can view
      if (
        applicantId !== jwtPayload.profile &&
        jobPosterId !== jwtPayload.profile
      ) {
        return fail({
          error: "You are not allowed to view this proposal",
          statusCode: 403,
        });
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

/**
 * PATCH /api/proposals/[id] - Update a proposal
 */
export const PATCH = withAuth<RouteContext>(
  async (req: NextRequest, jwtPayload: JwtPayload, context: RouteContext) => {
    try {
      const { id } = await context.params;
      const body = await req.json();

      // Verify ownership
      const proposalResult = await ProposalService.getById(id);
      if (!proposalResult.success) {
        return fail({ error: "Proposal not found", statusCode: 404 });
      }

      const applicantId =
        typeof proposalResult.data.applicant === "string"
          ? proposalResult.data.applicant
          : (proposalResult.data.applicant as { id: string }).id;

      if (applicantId !== jwtPayload.profile) {
        return fail({
          error: "You are not allowed to modify this resource",
          statusCode: 403,
        });
      }

      const { cover_letter, quoted_price, estimated_days } = body;
      const result = await ProposalService.update(id, {
        cover_letter,
        quoted_price,
        estimated_days,
      });

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
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

/**
 * DELETE /api/proposals/[id] - Withdraw a proposal
 */
export const DELETE = withAuth<RouteContext>(
  async (_req: NextRequest, jwtPayload: JwtPayload, context: RouteContext) => {
    try {
      const { id } = await context.params;

      // Verify ownership
      const proposalResult = await ProposalService.getById(id);
      if (!proposalResult.success) {
        return fail({ error: "Proposal not found", statusCode: 404 });
      }

      const applicantId =
        typeof proposalResult.data.applicant === "string"
          ? proposalResult.data.applicant
          : (proposalResult.data.applicant as { id: string }).id;

      if (applicantId !== jwtPayload.profile) {
        return fail({
          error: "You are not allowed to modify this resource",
          statusCode: 403,
        });
      }

      const result = await ProposalService.withdraw(id);

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
);
