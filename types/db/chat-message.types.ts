import { SystemFields } from "../generic.types";
import { ChatRoom } from "./chat-room.types";
import { Profile } from "./profile.types";

export interface ChatMessageCore {
  room: string | Partial<ChatRoom>;
  sender: string | Partial<Profile>;
  content: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
}

export interface ChatMessage extends ChatMessageCore, SystemFields {}
