import type { Gig } from "@/types/db/gig.types";
import type { Order } from "@/types/db/order.types";
import type { Profile } from "@/types/db/profile.types";

export interface Conversation {
  id: string;
  participant_1: string | Partial<Profile>;
  participant_2: string | Partial<Profile>;
  order: string | Partial<Order> | null;
  gig: string | Partial<Gig> | null;
  last_message_at: string | null;
  last_message_text: string | null;
  created_at: string;
}
