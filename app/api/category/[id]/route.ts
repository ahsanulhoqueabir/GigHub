import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { getRouteParam } from "@/lib/api/request-payload";
import { updateCategorySchema } from "@/lib/validations/category.schema";
import { CategoryService } from "@/services/category.service";
import { NextRequest } from "next/server";

// ─── GET /api/category/:id (public) ────────────────────────────────
export async function GET(
  _request: NextRequest,
  context: { params?: unknown },
) {
  try {
    const id = await getRouteParam(context, "id");
    if (!id) {
      return fail({ error: "Category ID is required", statusCode: 400 });
    }

    const result = await CategoryService.getById(id);

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

// ─── PATCH /api/category/:id (admin only) ──────────────────────────
export const PATCH = withAuth({
  handler: async ({ req, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Category ID is required", statusCode: 400 });
      }

      const payload = await parseBody(req, updateCategorySchema);
      if (payload instanceof Response) return payload;

      // Ensure at least one field is being updated
      if (Object.keys(payload as Record<string, unknown>).length === 0) {
        return fail({
          error: "At least one field must be provided for update",
        });
      }

      const result = await CategoryService.update(id, payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Category updated successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
  options: { allowedRoles: ["ADMIN"] },
});

// ─── DELETE /api/category/:id (admin only) ─────────────────────────
export const DELETE = withAuth({
  handler: async ({ params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Category ID is required", statusCode: 400 });
      }

      const result = await CategoryService.delete(id);

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
        message: "Category deleted successfully",
      });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
  options: { allowedRoles: ["ADMIN"] },
});
