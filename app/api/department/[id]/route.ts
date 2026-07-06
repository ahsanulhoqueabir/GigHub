import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { DepartmentService } from "@/services/department.service";
import { getRouteParam } from "@/lib/api/request-payload";

// ─── GET /api/department/:id (public) ─────────────────────────────
export async function GET(
  _request: NextRequest,
  context: { params?: unknown },
) {
  try {
    const id = await getRouteParam(context, "id");
    if (!id) {
      return fail({ error: "Department ID is required", statusCode: 400 });
    }

    const result = await DepartmentService.getById(id);

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
