export interface SystemFields {
  id: string;
  created_at: string;
  updated_at: string;
  status: Status;
}

export const STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DELETED: "DELETED",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  DECLINED: "DECLINED",
  IN_PROGRESS: "IN_PROGRESS",
  EXPIRED: "EXPIRED",
  PAUSED: "PAUSED",
  DELIVERED: "DELIVERED",
  REVIEW: "REVIEW",
  REVISION: "REVISION",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export type RecordContext =
  | Record<string, string>
  | Promise<Record<string, string>>;

export type QueryParams = Record<string, unknown>;
export type QueryFilter = Record<string, unknown>;
