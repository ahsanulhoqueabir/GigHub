import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { DepartmentService } from "@/services/department.service";
import { parsePagination, parseSorting } from "@/lib/api/request-payload";
import { paginationMeta } from "@/lib/pagination";

// ─── GET /api/department (public) ──────────────────────────────────
// Returns paginated list of ACTIVE departments only.
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(searchParams);
    const { sortBy, sortOrder } = parseSorting(searchParams, [
      "name",
      "code",
      "created_at",
      "acronym",
    ]);

    const result = await DepartmentService.list({
      page,
      limit,
      sortBy,
      sortOrder,
      statusFilter: "ACTIVE",
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
}
