import { NextRequest } from "next/server";
import { ok, fail, parseBody } from "@/lib/api/api-response";
import { AuthService } from "@/services/auth.service";
import { signUpSchema } from "@/lib/validations/auth.schema";

export async function POST(request: NextRequest) {
  try {
    const payload = await parseBody(request, signUpSchema);
    if (payload instanceof Response) return payload;

    // Create account via service
    const result = await AuthService.signup({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      student_id: payload.student_id,
      department: payload.department,
    });

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    return ok({
      data: {
        user: result.data.user,
        token: result.data.token,
      },
      message: "User created successfully",
      statusCode: 201,
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
