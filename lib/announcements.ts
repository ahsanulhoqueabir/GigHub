import type { BadgeVariant } from "@/components/ui/Badge";

/** Capitalizes only the first letter — custom/unknown type values still display correctly. */
export function capitalizeType(type: string): string {
  if (!type) return type;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

const TYPE_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  info: "info",
  warning: "warning",
  success: "success",
  error: "danger",
  maintenance: "default",
};

export function announcementBadgeVariant(type: string): BadgeVariant {
  return TYPE_BADGE_VARIANTS[type.toLowerCase()] ?? "default";
}

export function formatAnnouncementDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
