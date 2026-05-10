import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { JobService } from "@/services/job.service";
import type { JwtPayload } from "@/types/business/user.types";

/**
 * POST /api/jobs - Create a new job
 */
export const POST = withAuth(
  async (req: NextRequest, jwtPayload: JwtPayload) => {
    try {
      const body = await req.json();
      const {
        title,
        description,
        category_id,
        job_type,
        budget_min,
        budget_max,
        budget_type,
        required_skills,
        attachments,
      } = body;

      if (!title || !description || !category_id || !job_type) {
        return fail({
          error: "Title, description, category_id, and job_type are required",
        });
      }

      const result = await JobService.create({
        poster: jwtPayload.profile,
        category_id,
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
 * GET /api/jobs - List jobs with filtering and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const result = await JobService.list({
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      job_type: searchParams.get("job_type") || undefined,
      listing_scope: searchParams.get("listing_scope") || undefined,
      status: searchParams.get("status") || "open",
    });

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    const { jobs, total } = result.data;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const totalPages = Math.ceil(total / limit);

    return ok({
      data: jobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
