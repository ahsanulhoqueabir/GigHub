import type { Profile } from "@/types/db/profile.types";

export type NotificationType =
  | "new_order"
  | "order_update"
  | "order_delivered"
  | "order_completed"
  | "revision_requested"
  | "new_message"
  | "new_proposal"
  | "proposal_accepted"
  | "proposal_rejected"
  | "payment_received"
  | "payment_released"
  | "withdrawal_update"
  | "new_review"
  | "system";

export interface Notification {
  id: string;
  profile: string | Partial<Profile>;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}
