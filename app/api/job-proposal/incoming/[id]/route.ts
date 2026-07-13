import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { JobProposalService } from "@/services/job-proposal.service";
import { z } from "zod";

// ─── GET /api/job-proposal/incoming/[id] (authenticated) ─────────
// Returns full proposal detail with job, owner, category & applicant info.
// Access-gated: only the proposal applicant OR job owner can view.
export const GET = withAuth({
  handler: async ({ user, params }) => {
    try {
      const proposalId = params?.id;
      if (!proposalId) {
        return fail({ error: "Proposal ID is required", statusCode: 400 });
      }

      const result = await JobProposalService.getIncomingProposalById(
        proposalId,
        user.profile,
      );

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

// ─── Validation schema for approve action ─────────────────────────

const approveProposalSchema = z
  .object({
    action: z.literal("approve", {
      error: 'Action must be "approve"',
    }),
  })
  .strict();

// ─── PATCH /api/job-proposal/incoming/[id] (authenticated) ────────
// Approves a PENDING proposal and atomically creates an order.
// Only the job owner can perform this action.
export const PATCH = withAuth({
  handler: async ({ req, user, params }) => {
    try {
      const proposalId = params?.id;
      if (!proposalId) {
        return fail({ error: "Proposal ID is required", statusCode: 400 });
      }

      const payload = await parseBody(req, approveProposalSchema);
      if (payload instanceof Response) return payload;

      const result = await JobProposalService.approveProposal(
        proposalId,
        user.profile,
      );

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Proposal approved and order created successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
