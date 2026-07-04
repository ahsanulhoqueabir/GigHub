import { SystemFields } from "../generic.types";
import { Order } from "./order.types";
import { Profile } from "./profile.types";

// export interface ChatRoomOrderInfo {
//   id: string;
//   status: string;
//   code: string;
//   title: string;
//   total_price: number;
//   deadline: string | null;
//   source: OrderSource;
// }

export interface ChatRoomCore {
  order: string | Partial<Order>;
  buyer: string | Partial<Profile>;
  seller: string | Partial<Profile>;
}

export interface ChatRoom extends ChatRoomCore, SystemFields {}
