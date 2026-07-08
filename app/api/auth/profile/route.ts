import { fail, ok, parseBody } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { updateOwnProfileSchema } from "@/lib/validations/own-profile.schema";
import { ProfileService } from "@/services/profile.service";
import { NextRequest } from "next/server";

/**
 * GET /api/auth/profile
 *
 * Protected route — returns the authenticated user's full profile
 * (password excluded) with the department relation expanded.
 */
export const GET = withAuth({
  handler: async ({ user }) => {
    const result = await ProfileService.getOwnProfile(user.profile);

    if (!result.success) {
      return fail({ error: result.error, statusCode: 404 });
    }

    return ok({ data: result.data });
  },
});

/**
 * PATCH /api/auth/profile
 *
 * Protected route — updates the authenticated user's own profile.
 * Sensitive fields (role, status, verified, etc.) are sanitised
 * server-side by the service layer.
 */
export const PATCH = withAuth({
  handler: async ({ user, req }) => {
    const body = await parseBody(
      req as unknown as NextRequest,
      updateOwnProfileSchema,
    );
    if (body instanceof Response) return body;

    const result = await ProfileService.updateOwn(user.profile, body);

    if (!result.success) {
      return fail({ error: result.error, statusCode: 400 });
    }

    return ok({ data: result.data, message: "Profile updated successfully" });
  },
});
