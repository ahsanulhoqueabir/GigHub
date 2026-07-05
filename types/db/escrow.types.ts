import { SystemFields } from "../generic.types";
import { Profile } from "./profile.types";
import { Order } from "./order.types";

export interface EscrowCore {
  order: string | Partial<Order>;
  sender: string | Partial<Profile>;
  receiver: string | Partial<Profile>;
  amount: number;
  platform_fee: number;
  released_at?: string;
  auto_released_at?: string;
  note?: string;
}

export interface Escrow extends EscrowCore, SystemFields {}
