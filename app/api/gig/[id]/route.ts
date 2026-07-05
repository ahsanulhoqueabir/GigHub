import { NextRequest } from "next/server";
import { ok, fail, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { GigService } from "@/services/gig.service";
import { updateGigSchema } from "@/lib/validations/gig.schema";
import { getRouteParam } from "@/lib/api/request-payload";

// ─── GET /api/gig/:id (public) ────────────────────────────────────
// Returns a single gig by ID with seller, category, and reviews.
// Only ACTIVE gigs are visible. Auto-increments the view counter.
export async function GET(
  _request: NextRequest,
  context: { params?: unknown },
) {
  try {
    const id = await getRouteParam(context, "id");
    if (!id) {
      return fail({ error: "Gig ID is required", statusCode: 400 });
    }

    const result = await GigService.getById(id);

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

// ─── PATCH /api/gig/:id (seller or admin) ─────────────────────────
// Updates a gig. Authorization is checked via RPC.
export const PATCH = withAuth({
  handler: async ({ req, user, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Gig ID is required", statusCode: 400 });
      }

      const payload = await parseBody(req, updateGigSchema);
      if (payload instanceof Response) return payload;

      // Ensure at least one field is being updated
      if (Object.keys(payload).length === 0) {
        return fail({
          error: "At least one field must be provided for update",
        });
      }

      const result = await GigService.update(
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
        message: "Gig updated successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});

// ─── DELETE /api/gig/:id (seller or admin) ────────────────────────
// Deletes a gig. Authorization and active-order check via RPC.
export const DELETE = withAuth({
  handler: async ({ user, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Gig ID is required", statusCode: 400 });
      }

      const result = await GigService.delete(id, user.profile, user.role);

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
        message: "Gig deleted successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
