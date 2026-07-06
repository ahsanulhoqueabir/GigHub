import type { Status } from "@/types/generic.types";

/**
 * Tailwind color classes for each Status value.
 * Each entry provides [bg, text, ring] classes for the badge.
 */
export const STATUS_BADGE_COLORS: Record<
  Status,
  { bg: string; text: string; ring: string }
> = {
  DRAFT: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    ring: "ring-slate-600/20",
  },
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-600/20",
  },
  ACTIVE: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/20",
  },
  DELETED: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-600/20" },
  ON_HOLD: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    ring: "ring-slate-600/20",
  },
  COMPLETED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/20",
  },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-600/20" },
  DECLINED: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-600/20" },
  IN_PROGRESS: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-600/20",
  },
  EXPIRED: {
    bg: "bg-gray-50",
    text: "text-gray-500",
    ring: "ring-gray-400/20",
  },
  PAUSED: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    ring: "ring-yellow-600/20",
  },
  DELIVERED: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    ring: "ring-teal-600/20",
  },
  REVIEW: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-600/20",
  },
  REVISION: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    ring: "ring-orange-600/20",
  },
};

/** Fallback colour for unknown / unexpected status values. */
export const STATUS_BADGE_FALLBACK = {
  bg: "bg-gray-50",
  text: "text-gray-700",
  ring: "ring-gray-500/10",
};

/** Get colour classes for a given status value. */
export function getStatusBadgeColors(status: string): {
  bg: string;
  text: string;
  ring: string;
} {
  return STATUS_BADGE_COLORS[status as Status] ?? STATUS_BADGE_FALLBACK;
}

/* ------------------------------------------------------------------ */
/*  Role badge helpers                                                */
/* ------------------------------------------------------------------ */

import type { UserRole } from "@/types/db/profile.types";

export const ROLE_BADGE_COLORS: Record<
  UserRole,
  { bg: string; text: string; ring: string }
> = {
  USER: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-600/20",
  },
  ADMIN: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-600/20",
  },
};

export const ROLE_BADGE_FALLBACK = {
  bg: "bg-gray-50",
  text: "text-gray-700",
  ring: "ring-gray-500/10",
};

/** Get colour classes for a given user role. */
export function getRoleBadgeColors(role: string): {
  bg: string;
  text: string;
  ring: string;
} {
  return ROLE_BADGE_COLORS[role as UserRole] ?? ROLE_BADGE_FALLBACK;
}

/* ------------------------------------------------------------------ */
/*  Boolean badge helpers                                             */
/* ------------------------------------------------------------------ */

export const BOOLEAN_BADGE_COLORS = {
  true: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-600/20",
  },
  false: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-600/20" },
} as const;

export const BOOLEAN_BADGE_LABELS = {
  true: "Yes",
  false: "No",
} as const;

/** Get colour classes for a boolean value. */
export function getBooleanBadgeColors(value: boolean): {
  bg: string;
  text: string;
  ring: string;
} {
  return value ? BOOLEAN_BADGE_COLORS.true : BOOLEAN_BADGE_COLORS.false;
}
