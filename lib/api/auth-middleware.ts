import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt.helper";
import type { JwtPayload } from "@/types/business/user.types";
import type { UserRole } from "@/types/db/profile.types";

export type WithAuthOptions = {
  allowedRoles?: UserRole[];
};

export type AuthenticatedHandlerContext = {
  req: NextRequest;
  user: JwtPayload;
  params?: Record<string, string | undefined>;
};

export type AuthenticatedHandler = (
  ctx: AuthenticatedHandlerContext,
) => Promise<NextResponse>;

type WithAuthConfig = {
  handler: AuthenticatedHandler;
  options?: WithAuthOptions;
};

/**
 * Wraps an API route handler with JWT authentication and optional role-based
 * authorization.
 *
 * Extracts the Bearer token from the Authorization header, verifies it, and
 * passes the decoded payload to the handler. If `allowedRoles` is provided,
 * the user's role is checked against it — a 403 is returned if the role is
 * not permitted.
 *
 * The returned function matches Next.js's route handler signature
 * `(req, context) => response`, so the framework naturally passes the route
 * context (with `params`) as the second argument.
 *
 * Usage:
 * ```ts
 * // Any authenticated user
 * export const GET = withAuth({ handler: async ({ req, user }) => { … } });
 *
 * // Admin only with route params
 * export const PATCH = withAuth({
 *   handler: async ({ req, user, params }) => { … },
 *   options: { allowedRoles: ["ADMIN"] },
 * });
 * ```
 */
export function withAuth(
  config: WithAuthConfig,
): (req: NextRequest, context?: { params?: unknown }) => Promise<NextResponse> {
  const { handler, options } = config;

  return async (
    req: NextRequest,
    context?: { params?: unknown },
  ): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { success: false, error: "Missing or invalid Authorization header" },
          { status: 401 },
        );
      }

      const token = authHeader.slice(7); // Strip "Bearer "
      const payload = await verifyJwt(token);

      if (!payload) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired token" },
          { status: 401 },
        );
      }

      // Role-based authorization check
      if (
        options?.allowedRoles &&
        !options.allowedRoles.includes(payload.role)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden: Insufficient permissions",
          },
          { status: 403 },
        );
      }

      // Resolve route params from the context that Next.js passes
      const resolvedParams = context?.params
        ? ((await context.params) as Record<string, string | undefined>)
        : undefined;

      return handler({ req, user: payload, params: resolvedParams });
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
