import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { updateDepartmentSchema } from "@/lib/validations/department.schema";
import { DepartmentService } from "@/services/department.service";

// ─── GET /api/admin/departments/:id (admin only) ──────────────────
// Returns a department by ID (no status filter — can see DELETED too).
export const GET = withAuth({
  handler: async ({ params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Department ID is required", statusCode: 400 });
      }

      const result = await DepartmentService.getByIdAdmin(id);

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

// ─── PATCH /api/admin/departments/:id (admin only) ────────────────
export const PATCH = withAuth({
  handler: async ({ req, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Department ID is required", statusCode: 400 });
      }

      const payload = await parseBody(req, updateDepartmentSchema);
      if (payload instanceof Response) return payload;

      // Ensure at least one field is being updated
      if (Object.keys(payload as Record<string, unknown>).length === 0) {
        return fail({
          error: "At least one field must be provided for update",
        });
      }

      const result = await DepartmentService.update(id, payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Department updated successfully",
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

// ─── DELETE /api/admin/departments/:id (admin only) ───────────────
export const DELETE = withAuth({
  handler: async ({ params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Department ID is required", statusCode: 400 });
      }

      const result = await DepartmentService.delete(id);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Department deleted successfully",
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
