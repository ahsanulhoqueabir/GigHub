import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { AuthService } from "@/services/auth.service";
import { sanitizeSignUpPayload } from "@/lib/payload/auth-payload";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = sanitizeSignUpPayload(body);

    // Validate required fields
    if (!payload.name || !payload.email || !payload.password) {
      return fail({ error: "Name, email, and password are required" });
    }

    if (!payload.student_id) {
      return fail({ error: "Student ID is required" });
    }

    if (!payload.department) {
      return fail({ error: "Department is required" });
    }

    if (payload.password.length < 6) {
      return fail({ error: "Password must be at least 6 characters" });
    }

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
