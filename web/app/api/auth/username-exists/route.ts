import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { ProfileService } from "@/services/profile.service";

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username")?.trim();

    if (!username) {
      return fail({ error: "Username is required" });
    }

    const result = await ProfileService.checkUsernameExists(username);

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    return ok({ data: { exists: result.data.exists } });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
