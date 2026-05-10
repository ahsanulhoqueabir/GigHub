import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { JobService } from "@/services/job.service";
import type { JwtPayload } from "@/types/business/user.types";

type RouteContext = { params: Promise<{ slug: string }> };

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/jobs/[slug] - Get job detail by slug
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const result = await JobService.getBySlug(slug);

    if (!result.success) {
      return fail({ error: "Job not found", statusCode: 404 });
    }

    return ok({ data: result.data });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}

/**
 * PATCH /api/jobs/[slug] - Update a job (edit or status change)
 */
export const PATCH = withAuth<RouteContext>(
  async (req: NextRequest, jwtPayload: JwtPayload, context: RouteContext) => {
    try {
      const { slug } = await context.params;
      const body = await req.json();

      // Resolve to UUID
      let jobId: string;
      if (UUID_REGEX.test(slug)) {
        jobId = slug;
      } else {
        const jobResult = await JobService.getBySlug(slug);
        if (!jobResult.success) {
          return fail({ error: "Job not found", statusCode: 404 });
        }
        jobId = jobResult.data.id;
      }

      // Verify ownership
      const jobResult = await JobService.getById(jobId);
      if (!jobResult.success) {
        return fail({ error: "Job not found", statusCode: 404 });
      }

      if (jobResult.data.poster !== jwtPayload.profile) {
        return fail({
          error: "You are not allowed to modify this resource",
          statusCode: 403,
        });
      }

      const { type } = body;

      if (type === "edit") {
        const {
          title,
          description,
          job_type,
          budget_min,
          budget_max,
          budget_type,
          required_skills,
          attachments,
        } = body;

        const result = await JobService.update(jobId, {
          title,
          description,
          job_type,
          budget_min,
          budget_max,
          budget_type,
          required_skills,
          attachments,
        });

        if (!result.success) {
          return fail({ error: result.error, statusCode: 400 });
        }

        return ok({ data: result.data });
      }

      if (type === "status") {
        const { status } = body;

        if (!status) {
          return fail({ error: "Bad Request", statusCode: 400 });
        }

        if (!["open", "closed"].includes(status)) {
          return fail({
            error: "Must be one of: open, closed",
            statusCode: 400,
          });
        }

        const result = await JobService.update(jobId, { status });

        if (!result.success) {
          return fail({ error: result.error, statusCode: 400 });
        }

        return ok({ data: result.data });
      }

      return fail({
        error: "Bad Request - type must be 'edit' or 'status'",
        statusCode: 400,
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
);

/**
 * DELETE /api/jobs/[slug] - Cancel a job by ID
 */
export const DELETE = withAuth<RouteContext>(
  async (_req: NextRequest, jwtPayload: JwtPayload, context: RouteContext) => {
    try {
      const { slug } = await context.params;

      if (!UUID_REGEX.test(slug)) {
        return fail({ error: "Job not found", statusCode: 404 });
      }

      // Verify ownership
      const jobResult = await JobService.getById(slug);
      if (!jobResult.success) {
        return fail({ error: "Job not found", statusCode: 404 });
      }

      if (jobResult.data.poster !== jwtPayload.profile) {
        return fail({
          error: "You are not allowed to modify this resource",
          statusCode: 403,
        });
      }

      const result = await JobService.cancel(slug);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 404 });
      }

      return ok({
        data: result.data,
        message: "Job cancelled successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
);
