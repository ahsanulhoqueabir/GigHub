import type { Conversation } from "@/types/db/conversation.types";
import type { Profile } from "@/types/db/profile.types";

export type MessageType = "text" | "image" | "file" | "voice" | "system";

export interface Message {
  id: string;
  conversation: string | Partial<Conversation>;
  sender: string | Partial<Profile>;
  content: string | null;
  message_type: MessageType;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}
