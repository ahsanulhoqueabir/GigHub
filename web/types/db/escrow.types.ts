import type { Order } from "@/types/db/order.types";
import type { Profile } from "@/types/db/profile.types";

export type EscrowStatus = "held" | "released" | "refunded" | "disputed";

export interface Escrow {
  id: string;
  order: string | Partial<Order>;
  buyer: string | Partial<Profile>;
  seller: string | Partial<Profile>;
  amount: number;
  platform_fee: number;
  status: EscrowStatus;
  released_at: string | null;
  auto_release_at: string | null;
  created_at: string;
  updated_at: string;
}
