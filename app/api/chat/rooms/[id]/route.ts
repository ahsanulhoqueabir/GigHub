import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { ChatService } from "@/services/chat.service";

/**
 * GET /api/chat/rooms/[id]
 * Returns details of a specific chat room if the authenticated user is a participant.
 */
export const GET = withAuth({
  handler: async ({ user, params }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Room ID is required", statusCode: 400 });
      }

      const result = await ChatService.getRoomById(id, user.profile);

      if (!result.success) {
        return fail({ error: result.error, statusCode: 403 });
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
