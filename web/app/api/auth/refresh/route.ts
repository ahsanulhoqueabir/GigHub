import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { signJwt, signRefreshJwt, verifyJwt } from "@/lib/jwt.helper";
import type { JwtPayload } from "@/types/business/user.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return fail({ error: "Refresh token is required" });
    }

    // Verify the refresh token
    const payload = await verifyJwt(refresh_token);

    if (!payload) {
      return fail({
        error: "Invalid or expired refresh token",
        statusCode: 401,
      });
    }

    // Generate new token pair
    const jwtPayload: JwtPayload = {
      profile: payload.profile,
      email: payload.email,
      role: payload.role,
    };

    const accessToken = await signJwt(jwtPayload);
    const refreshToken = await signRefreshJwt(jwtPayload);

    return ok({
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: "15m",
      },
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
