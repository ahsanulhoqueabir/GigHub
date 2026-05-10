import type { Order } from "@/types/db/order.types";
import type { OrderMilestone } from "@/types/db/order-milestone.types";
import type { Profile } from "@/types/db/profile.types";

export type OrderDeliveryType = "delivery" | "revision";
export type OrderDeliveryStatus = "pending" | "accepted" | "revision_requested";

export interface OrderDelivery {
  id: string;
  order: string | Partial<Order>;
  milestone: string | Partial<OrderMilestone> | null;
  seller: string | Partial<Profile>;
  message: string;
  files: string[];
  delivery_type: OrderDeliveryType;
  status: OrderDeliveryStatus;
  created_at: string;
}
