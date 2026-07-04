import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { AuthService } from "@/services/auth.service";
import { sanitizeLoginPayload } from "@/lib/payload/auth-payload";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = sanitizeLoginPayload(body);

    // Validate required fields
    if (!payload.emailOrUsername || !payload.password) {
      return fail({ error: "Email/Username and password are required" });
    }

    // Authenticate user
    const result = await AuthService.login({
      emailOrUsername: payload.emailOrUsername,
      password: payload.password,
    });

    if (!result.success) {
      return fail({ error: result.error, statusCode: 401 });
    }

    return ok({
      data: {
        user: result.data.user,
        token: result.data.token,
      },
      message: "Login successful",
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
