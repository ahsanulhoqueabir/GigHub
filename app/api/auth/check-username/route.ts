import { fail, ok } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { ProfileService } from "@/services/profile.service";

/**
 * GET /api/auth/check-username?username=foo
 *
 * Protected route — checks whether a username is available.
 * The authenticated user's own ID is excluded so they can keep
 * their current username.
 */
export const GET = withAuth({
  handler: async ({ user, req }) => {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username")?.trim();

    if (!username || username.length === 0) {
      return fail({ error: "Username is required" });
    }

    const result = await ProfileService.checkUsername(username, user.profile);

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    return ok({ data: result.data });
  },
});
