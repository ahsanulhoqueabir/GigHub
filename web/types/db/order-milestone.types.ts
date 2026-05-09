import type { Order } from "@/types/db/order.types";

export type OrderMilestoneStatus =
  | "pending"
  | "in_progress"
  | "delivered"
  | "approved"
  | "revision_requested";

export interface OrderMilestone {
  id: string;
  order: string | Partial<Order>;
  title: string;
  description: string | null;
  amount: number;
  due_date: string | null;
  status: OrderMilestoneStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
