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
  ACCEPTED: {
    bg: "bg-green-700",
    text: "text-white",
    ring: "ring-green-700/20",
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
/*  Job-type badge helpers                                            */
/* ------------------------------------------------------------------ */

import type { JobType } from "@/types/db/job.types";

export type JobTypeBadgeColors = {
  bg: string;
  text: string;
  ring: string;
  label: string;
};

export const JOB_TYPE_BADGE_COLORS: Record<JobType, JobTypeBadgeColors> = {
  FULLTIME: {
    bg: "bg-sky-200 text-sky-900 dark:bg-sky-500/20 dark:text-sky-300",
    text: "text-sky-900 dark:text-sky-300",
    ring: "ring-sky-500/30",
    label: "Full Time",
  },

  PARTTIME: {
    bg: "bg-lime-200 text-lime-900 dark:bg-lime-500/20 dark:text-lime-300",
    text: "text-lime-900 dark:text-lime-300",
    ring: "ring-lime-500/30",
    label: "Part Time",
  },

  CONTRACT: {
    bg: "bg-fuchsia-200 text-fuchsia-900 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",
    text: "text-fuchsia-900 dark:text-fuchsia-300",
    ring: "ring-fuchsia-500/30",
    label: "Contract",
  },

  TUTION: {
    bg: "bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300",
    text: "text-amber-900 dark:text-amber-300",
    ring: "ring-amber-500/30",
    label: "Tuition",
  },

  VOLUNTEER: {
    bg: "bg-teal-200 text-teal-900 dark:bg-teal-500/20 dark:text-teal-300",
    text: "text-teal-900 dark:text-teal-300",
    ring: "ring-teal-500/30",
    label: "Volunteer",
  },

  OTHER: {
    bg: "bg-slate-200 text-slate-900 dark:bg-slate-500/20 dark:text-slate-300",
    text: "text-slate-900 dark:text-slate-300",
    ring: "ring-slate-500/30",
    label: "Other",
  },
};

export const JOB_TYPE_BADGE_FALLBACK: JobTypeBadgeColors = {
  bg: "bg-gray-50",
  text: "text-gray-700",
  ring: "ring-gray-500/10",
  label: "Unknown",
};

/** Get colour classes for a given job type. */
export function getJobTypeBadgeColors(type: string): JobTypeBadgeColors {
  return JOB_TYPE_BADGE_COLORS[type as JobType] ?? JOB_TYPE_BADGE_FALLBACK;
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
