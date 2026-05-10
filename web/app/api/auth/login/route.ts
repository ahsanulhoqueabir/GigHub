import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { AuthService } from "@/services/auth.service";
import { signRefreshJwt } from "@/lib/jwt.helper";
import type { JwtPayload } from "@/types/business/user.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return fail({ error: "Email and password are required" });
    }

    // Authenticate user
    const result = await AuthService.login({ email, password });

    if (!result.success) {
      return fail({ error: result.error, statusCode: 401 });
    }

    // Generate refresh token with longer expiry
    const refreshPayload: JwtPayload = {
      profile: result.data.user.id,
      email: result.data.user.email,
      role: result.data.user.role,
    };
    const refreshToken = await signRefreshJwt(refreshPayload);

    return ok({
      data: {
        user: result.data.user,
        access_token: result.data.token,
        refresh_token: refreshToken,
        expires_in: "15m",
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
