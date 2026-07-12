import { ok, fail, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { JobProposalService } from "@/services/job-proposal.service";
import { updateAppliedJobProposalSchema } from "@/lib/validations/job-proposal.schema";

// ─── GET /api/applied-jobs/[id] (protected) ───────────────────────────────
// Returns full proposal + job details.
// Access gate: returns 404 if caller is not the applicant or job owner.
export const GET = withAuth({
  handler: async ({ user, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Applied job ID is required", statusCode: 400 });
      }

      const result = await JobProposalService.getAppliedJobById(id, user.profile);

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

// ─── PATCH /api/applied-jobs/[id] (protected — applicant or ADMIN) ────────
// Edits description, attachments, or toggles status DRAFT ↔ PENDING.
export const PATCH = withAuth({
  handler: async ({ req, user, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Applied job ID is required", statusCode: 400 });
      }

      const payload = await parseBody(req, updateAppliedJobProposalSchema);
      if (payload instanceof Response) return payload;

      const result = await JobProposalService.updateAppliedJob(
        id,
        user.profile,
        user.role,
        payload,
      );

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Proposal updated successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});

