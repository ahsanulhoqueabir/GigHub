import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { updateProfileSchema } from "@/lib/validations/profile.schema";
import { ProfileService } from "@/services/profile.service";

// ─── GET /api/admin/users/:id (admin only) ────────────────────────
// Returns a single profile's details.
export const GET = withAuth({
  handler: async ({ params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "User ID is required", statusCode: 400 });
      }

      const result = await ProfileService.getById(id);

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
  options: { allowedRoles: ["ADMIN"] },
});

// ─── PATCH /api/admin/users/:id (admin only) ──────────────────────
// Update a user's profile (admin can update any field).
export const PATCH = withAuth({
  handler: async ({ req, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "User ID is required", statusCode: 400 });
      }

      const payload = await parseBody(req, updateProfileSchema);
      if (payload instanceof Response) return payload;

      // Ensure at least one field is being updated
      if (Object.keys(payload as Record<string, unknown>).length === 0) {
        return fail({
          error: "At least one field must be provided for update",
        });
      }

      const result = await ProfileService.update(id, payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "User updated successfully",
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

// ─── DELETE /api/admin/users/:id (admin only) ─────────────────────
// Soft-delete a user profile.
export const DELETE = withAuth({
  handler: async ({ params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "User ID is required", statusCode: 400 });
      }

      const result = await ProfileService.delete(id);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "User deleted successfully",
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
