import { ok, fail } from "@/lib/api/api-response";
import { withAuth } from "@/lib/api/auth-middleware";
import { ChatService } from "@/services/chat.service";

/**
 * GET /api/chat/rooms/[id]/messages
 * Returns cursor-paginated chat messages for the room.
 * Query parameters:
 *  - cursor: ISO-8601 created_at timestamp string
 *  - limit: default 50, maximum 50
 */
export const GET = withAuth({
  handler: async ({ user, params, req }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Room ID is required", statusCode: 400 });
      }

      const searchParams = req.nextUrl.searchParams;
      const cursor = searchParams.get("cursor") || undefined;
      const limitStr = searchParams.get("limit");
      const limit = limitStr ? Math.min(50, Math.max(1, parseInt(limitStr, 10))) : 50;

      const result = await ChatService.listMessages(id, user.profile, limit, cursor);

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

/**
 * POST /api/chat/rooms/[id]/messages
 * Sends a new message in the room.
 * Body:
 *  - content: string | null
 *  - attachment: { url: string; name: string; type: string } | null (optional)
 */
export const POST = withAuth({
  handler: async ({ user, params, req }) => {
    try {
      const id = params?.id;
      if (!id) {
        return fail({ error: "Room ID is required", statusCode: 400 });
      }

      const body = (await req.json()) as {
        content: string | null;
        attachment?: { url: string; name: string; type: string } | null;
      };

      if (!body.content && !body.attachment) {
        return fail({ error: "Message content or attachment is required", statusCode: 400 });
      }

      const result = await ChatService.sendMessage(
        id,
        user.profile,
        body.content,
        body.attachment
      );

      if (!result.success) {
        return fail({ error: result.error, statusCode: 400 });
      }

      return ok({ data: result.data, statusCode: 201 });
    } catch (err) {
      return fail({
        error: (err as Error).message || "An unknown error occurred",
        statusCode: 500,
      });
    }
  },
});
