import type { Profile } from "@/types/db/profile.types";

export type ReportEntityType = "gig" | "job" | "profile" | "review" | "message";
export type ReportReason =
  | "spam"
  | "inappropriate"
  | "fraud"
  | "harassment"
  | "other";
export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";

export interface Report {
  id: string;
  reporter: string | Partial<Profile>;
  entity_type: ReportEntityType;
  entity_id: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  admin_note: string | null;
  resolved_by: string | Partial<Profile> | null;
  resolved_at: string | null;
  created_at: string;
}
