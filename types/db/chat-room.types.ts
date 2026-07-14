import { SystemFields } from "../generic.types";
import { Order } from "./order.types";
import { Profile } from "./profile.types";

export interface ChatRoomCore {
  title: string;
  order: string | Partial<Order>;
  buyer: string | Partial<Profile>;
  seller: string | Partial<Profile>;
}

export interface ChatRoom extends ChatRoomCore, SystemFields {}
