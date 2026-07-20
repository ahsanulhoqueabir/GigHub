import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { parsePagination, parseSorting } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";
import {
  createUserSchema,
  type CreateUserInput,
} from "@/lib/validations/profile.schema";
import { ProfileService } from "@/services/profile.service";

// ─── GET /api/admin/users (admin only) ────────────────────────────
// Returns a paginated list of all profiles.
export const GET = withAuth({
  handler: async ({ req }) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const { page, limit } = parsePagination(searchParams);
      const { sortBy, sortOrder } = parseSorting(searchParams, [
        "name",
        "email",
        "username",
        "role",
        "created_at",
        "updated_at",
        "verified",
      ]);

      const role = searchParams.get("role") ?? undefined;
      const status = searchParams.get("status") ?? undefined;
      const search = searchParams.get("search") ?? undefined;

      const result = await ProfileService.list({
        page,
        limit,
        role,
        status,
        search,
        sortBy,
        sortOrder,
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

// ─── POST /api/admin/users (admin only) ───────────────────────────
// Create a new user directly (admin only).
export const POST = withAuth({
  handler: async ({ req }) => {
    try {
      const body = await parseBody(req, createUserSchema);
      if (body instanceof Response) return body;

      const payload = body as CreateUserInput;
      const result = await ProfileService.create({
        name: payload.name,
        email: payload.email,
        username: payload.username,
        password: payload.password,
        student_id: payload.student_id,
        department: payload.department,
      });

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({
        data: result.data,
        message: "User created successfully",
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
