import { NextRequest } from "next/server";
import { ok, fail, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { JobProposalService } from "@/services/job-proposal.service";
import { updateJobProposalSchema } from "@/lib/validations/job-proposal.schema";
import { getRouteParam } from "@/lib/api/request-payload";

// ─── GET /api/job-proposal/:id (public) ───────────────────────────
// Returns a single job proposal by ID with job and applicant data.
export async function GET(
  _request: NextRequest,
  context: { params?: unknown },
) {
  try {
    const id = await getRouteParam(context, "id");
    if (!id) {
      return fail({ error: "Job proposal ID is required", statusCode: 400 });
    }

    const result = await JobProposalService.getById(id);

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
}

// ─── PATCH /api/job-proposal/:id (applicant or admin) ─────────────
// Updates a job proposal. Only description and attachments can be changed.
// Job ID and applicant are immutable after creation.
export const PATCH = withAuth({
  handler: async ({ req, user, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Job proposal ID is required", statusCode: 400 });
      }

      const payload = await parseBody(req, updateJobProposalSchema);
      if (payload instanceof Response) return payload;

      const result = await JobProposalService.update(
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
        message: "Job proposal updated successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});

// ─── DELETE /api/job-proposal/:id (applicant or admin) ────────────
// Deletes a job proposal. Authorization and active-order check via RPC.
// This is a HARD DELETE (record is removed) — only if no active order
// references the proposal.
export const DELETE = withAuth({
  handler: async ({ user, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Job proposal ID is required", statusCode: 400 });
      }

      const result = await JobProposalService.delete(
        id,
        user.profile,
        user.role,
      );

      if (!result.success) {
        // If references exist, include them in the response
        if (result.references) {
          return fail({
            error: result.error,
            data: { references: result.references },
            statusCode: 409, // Conflict
          });
        }
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Job proposal deleted successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
