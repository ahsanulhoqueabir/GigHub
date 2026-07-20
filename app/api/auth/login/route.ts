import { fail, ok, parseBody } from "@/lib/api/api-response";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import { AuthService } from "@/services/auth.service";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseBody(request, loginSchema);
    if (parsed instanceof Response) return parsed;

    const payload = parsed as LoginInput;
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
