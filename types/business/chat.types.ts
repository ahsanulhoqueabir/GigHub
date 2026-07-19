import type { ChatMessage } from "@/types/db/chat-message.types";
import type { ChatRoom } from "@/types/db/chat-room.types";
import type { Order } from "@/types/db/order.types";
import type { ProfileMinimal } from "@/types/db/profile.types";

type ChatRoomOrder = Pick<
  Order,
  "id" | "code" | "title" | "status" | "total_price"
>;

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

export interface ChatRoomWithDetails
  extends Pick<
    ChatRoom,
    "id" | "created_at" | "updated_at" | "status" | "title"
  > {
  buyer: ProfileMinimal;
  seller: ProfileMinimal;
  order: ChatRoomOrder;
  latest_message: ChatMessagePreview | null;
}
