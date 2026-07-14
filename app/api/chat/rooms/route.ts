import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { ChatService } from "@/services/chat.service";

/**
 * GET /api/chat/rooms
 * Returns all chat rooms where the authenticated user is a participant.
 */
export const GET = withAuth({
  handler: async ({ user }) => {
    try {
      const result = await ChatService.listRooms(user.profile);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 500 });
      }

      return ok({ data: result.data });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
