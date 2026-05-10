import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { GigService } from "@/services/gig.service";
import type { JwtPayload } from "@/types/business/user.types";

type RouteContext = { params: Promise<{ slug: string }> };

// UUID regex to detect if the slug param is actually a UUID (gig ID)
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/gigs/[slug] - Get gig detail by slug
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const result = await GigService.getBySlug(slug);

    if (!result.success) {
      return fail({ error: "Gig not found", statusCode: 404 });
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
 * PATCH /api/gigs/[slug] - Update a gig (edit or status change)
 * The param can be either a slug (for read) or a UUID (for write operations)
 */
export const PATCH = withAuth<RouteContext>(
  async (req: NextRequest, jwtPayload: JwtPayload, context: RouteContext) => {
    try {
      const { slug } = await context.params;
      const body = await req.json();

      // Determine if param is a UUID (gig ID) or slug
      let gigId: string;
      if (UUID_REGEX.test(slug)) {
        gigId = slug;
      } else {
        // Look up by slug to get the ID
        const gigResult = await GigService.getBySlug(slug);
        if (!gigResult.success) {
          return fail({ error: "Gig not found", statusCode: 404 });
        }
        gigId = gigResult.data.id;
      }

      // Verify ownership
      const gigResult = await GigService.getById(gigId);
      if (!gigResult.success) {
        return fail({ error: "Gig not found", statusCode: 404 });
      }

      if (gigResult.data.seller !== jwtPayload.profile) {
        return fail({
          error: "You are not allowed to modify this resource",
          statusCode: 403,
        });
      }

      const { type } = body;

      if (type === "edit") {
        const { title, description, tags, packages, images } = body;
        const result = await GigService.update(gigId, {
          title,
          description,
          tags,
          packages,
          images,
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

        if (!["active", "paused"].includes(status)) {
          return fail({
            error: "Must be one of: active, paused",
            statusCode: 400,
          });
        }

        const result = await GigService.update(gigId, { status });

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
 * DELETE /api/gigs/[slug] - Soft-delete a gig by ID
 */
export const DELETE = withAuth<RouteContext>(
  async (_req: NextRequest, jwtPayload: JwtPayload, context: RouteContext) => {
    try {
      const { slug } = await context.params;

      // This route expects a UUID (gig ID)
      if (!UUID_REGEX.test(slug)) {
        return fail({ error: "Gig not found", statusCode: 404 });
      }

      // Verify ownership
      const gigResult = await GigService.getById(slug);
      if (!gigResult.success) {
        return fail({ error: "Gig not found", statusCode: 404 });
      }

      if (gigResult.data.seller !== jwtPayload.profile) {
        return fail({
          error: "You are not allowed to modify this resource",
          statusCode: 403,
        });
      }

      const result = await GigService.softDelete(slug);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 404 });
      }

      return ok({
        data: result.data,
        message: "Gig deleted successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
);
