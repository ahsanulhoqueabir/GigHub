import { NextRequest } from "next/server";
import { ok, fail, parseBody } from "@/lib/api/api-response";
import { AuthService } from "@/services/auth.service";
import { loginSchema } from "@/lib/validations/auth.schema";

export async function POST(request: NextRequest) {
  try {
    const payload = await parseBody(request, loginSchema);
    if (payload instanceof Response) return payload;

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
