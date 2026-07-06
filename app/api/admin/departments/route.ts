import { ok, fail, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { DepartmentService } from "@/services/department.service";
import { createDepartmentSchema } from "@/lib/validations/department.schema";
import { parsePagination, parseSorting } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";

// ─── GET /api/admin/departments (admin only) ──────────────────────
// Returns paginated list of ALL departments (including non-active).
// Supports optional ?status=DRAFT|ACTIVE|... filter.
export const GET = withAuth({
  handler: async ({ req }) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const { page, limit } = parsePagination(searchParams);
      const { sortBy, sortOrder } = parseSorting(searchParams, [
        "name",
        "code",
        "created_at",
        "acronym",
        "status",
      ]);

      const status = searchParams.get("status") ?? undefined;
      const includeDeleted = searchParams.get("includeDeleted") === "true";

      const result = await DepartmentService.list({
        page,
        limit,
        sortBy,
        sortOrder,
        statusFilter: status,
        includeDeleted,
      });

      if (!result.success) {
        return fail({ error: result.error, statusCode: 500 });
      }

      const pagination = paginationMeta({
        page,
        limit,
        totalItems: result.data.total,
      });

      return ok({
        data: {
          items: result.data.items,
          pagination,
        },
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

// ─── POST /api/admin/departments (admin only) ─────────────────────
export const POST = withAuth({
  handler: async ({ req }) => {
    try {
      const payload = await parseBody(req, createDepartmentSchema);
      if (payload instanceof Response) return payload;

      const result = await DepartmentService.create(payload);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "Department created successfully",
        statusCode: 201,
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
