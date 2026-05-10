import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt.helper";
import type { JwtPayload } from "@/types/business/user.types";

export type AuthenticatedHandler<TContext = undefined> = (
  req: NextRequest,
  jwtPayload: JwtPayload,
  context: TContext,
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with JWT authentication.
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and passes the decoded payload to the handler.
 *
 * For static routes:
 *   export const GET = withAuth(async (req, jwtPayload) => { … });
 *
 * For dynamic routes with params:
 *   export const GET = withAuth<{ params: Promise<{ id: string }> }>(
 *     async (req, jwtPayload, ctx) => { const { id } = await ctx.params; … }
 *   );
 */
export function withAuth<TContext = undefined>(
  handler: AuthenticatedHandler<TContext>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: NextRequest, ...rest: any[]): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { success: false, error: "Missing or invalid Authorization header" },
          { status: 401 },
        );
      }

      const token = authHeader.slice(7);
      const payload = await verifyJwt(token);

      if (!payload) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired token" },
          { status: 401 },
        );
      }

      const context = (rest[0] ?? undefined) as TContext;
      return handler(req, payload, context);
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: (err as Error).message || "Authentication failed",
        },
        { status: 401 },
      );
    }
  };
}
