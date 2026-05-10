import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { CategoryService } from "@/services/category.service";

export async function GET(_request: NextRequest) {
  try {
    const result = await CategoryService.list();

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    return ok({ data: result.data });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
