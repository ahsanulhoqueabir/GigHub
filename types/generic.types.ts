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
  ACCEPTED: "ACCEPTED",
  APPROVED: "APPROVED",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export type RecordContext =
  | Record<string, string>
  | Promise<Record<string, string>>;

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ServiceResultWithReferences<T = any> = ServiceResult<T> & {
  references?: { orders: number };
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export type QueryParams = Record<string, unknown>;
export type QueryFilter = Record<string, unknown>;
