import { withAuth } from "@/lib/api/auth-middleware";
import { ProfileService } from "@/services/profile.service";
import { fail, ok } from "@/lib/api/api-response";

/**
 * GET /api/auth/me
 *
 * Protected route — returns the authenticated user's profile data.
 * The JWT token is verified by `withAuth`, and the decoded payload
 * (which contains the profile ID) is passed to the handler.
 */
export const GET = withAuth(async ({ user }) => {
  const result = await ProfileService.getById(user.profile);

  if (!result.success) {
    return fail({ error: result.error, statusCode: 404 });
  }

  const profile = result.data;

  return ok({
    data: {
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        username: profile.username,
        role: profile.role,
        student_id: profile.student_id ?? null,
        department: profile.department ?? null,
      },
    },
  });
});
