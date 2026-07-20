import { fail, ok, parseBody } from "@/lib/api/api-response";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth.schema";
import { AuthService } from "@/services/auth.service";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseBody(request, signUpSchema);
    if (parsed instanceof Response) return parsed;

    const payload = parsed as SignUpInput;
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
