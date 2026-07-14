import { error, success } from "@/lib/api/api-response";
import { getSupabaseServerClient } from "@/lib/api/supabase";
import type { ChatMessage } from "@/types/db/chat-message.types";
import type { ChatRoom } from "@/types/db/chat-room.types";
import type { Order } from "@/types/db/order.types";
import type { ProfileMinimal } from "@/types/db/profile.types";
import type { ServiceResult } from "@/types/generic.types";

// ── Types ──────────────────────────────────────────────────────────────

type ChatRoomOrder = Pick<
  Order,
  "id" | "code" | "title" | "status" | "total_price"
>;

export interface ChatRoomWithDetails extends Pick<
  ChatRoom,
  "id" | "created_at" | "updated_at" | "status" | "title"
> {
  buyer: ProfileMinimal;
  seller: ProfileMinimal;
  order: ChatRoomOrder;
  latest_message: ChatMessagePreview | null;
}

export type ChatMessagePreview = Pick<
  ChatMessage,
  | "id"
  | "content"
  | "created_at"
  | "attachment_url"
  | "attachment_name"
  | "attachment_type"
> & {
  sender: string;
};

export interface ChatMessageWithSender extends Pick<
  ChatMessage,
  | "id"
  | "created_at"
  | "updated_at"
  | "status"
  | "content"
  | "attachment_url"
  | "attachment_name"
  | "attachment_type"
> {
  room: string;
  sender: ProfileMinimal;
}

interface RpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Service ────────────────────────────────────────────────────────────

export class ChatService {
  /**
   * List all chat rooms for a user profile (buyer or seller).
   * Uses the `list_chat_rooms` RPC — single round-trip with latest message.
   */
  static async listRooms(
    profileId: string,
  ): Promise<ServiceResult<ChatRoomWithDetails[]>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "list_chat_rooms",
        { p_profile_id: profileId },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as RpcResponse<ChatRoomWithDetails[]>;

      if (!result.success) {
        return error(result.error ?? "Failed to list chat rooms");
      }

      return success(result.data ?? []);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Get room details by ID with access control baked in.
   * Uses the `get_chat_room_by_id` RPC.
   */
  static async getRoomById(
    roomId: string,
    profileId: string,
  ): Promise<ServiceResult<ChatRoomWithDetails>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "get_chat_room_by_id",
        {
          p_room_id: roomId,
          p_caller_profile: profileId,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as RpcResponse<ChatRoomWithDetails>;

      if (!result.success || !result.data) {
        return error(result.error ?? "Chat room not found");
      }

      return success(result.data);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * List messages in a room with cursor-based pagination.
   * Uses the `list_chat_messages` RPC — access check + messages in one call.
   */
  static async listMessages(
    roomId: string,
    profileId: string,
    limit = 50,
    cursor?: string,
  ): Promise<
    ServiceResult<{
      messages: ChatMessageWithSender[];
      nextCursor: string | null;
    }>
  > {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "list_chat_messages",
        {
          p_room_id: roomId,
          p_caller_profile: profileId,
          p_limit: limit,
          p_cursor: cursor ?? null,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as RpcResponse<{
        messages: ChatMessageWithSender[];
        nextCursor: string | null;
      }>;

      if (!result.success) {
        return error(result.error ?? "Failed to list messages");
      }

      return success({
        messages: result.data?.messages ?? [],
        nextCursor: result.data?.nextCursor ?? null,
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Send a message and update the room's updated_at atomically.
   * Uses the `send_chat_message` RPC — access check + insert + room update
   * in a single transaction.
   */
  static async sendMessage(
    roomId: string,
    senderId: string,
    content: string | null,
    attachment?: { url: string; name: string; type: string } | null,
  ): Promise<ServiceResult<ChatMessageWithSender>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc(
        "send_chat_message",
        {
          p_room_id: roomId,
          p_sender_id: senderId,
          p_content: content,
          p_attachment_url: attachment?.url ?? null,
          p_attachment_name: attachment?.name ?? null,
          p_attachment_type: attachment?.type ?? null,
        },
      );

      if (rpcError) {
        return error(rpcError.message);
      }

      const result = data as RpcResponse<ChatMessageWithSender>;

      if (!result.success || !result.data) {
        return error(result.error ?? "Failed to send message");
      }

      return success(result.data);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
