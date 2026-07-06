import { cn } from "@/lib/utils";
import {
  getBooleanBadgeColors,
  BOOLEAN_BADGE_LABELS,
} from "@/lib/shared/badge.utils";

export interface BooleanBadgeProps {
  value: boolean;
  /** Override the displayed text (defaults to "Yes" / "No"). */
  labels?: { true: string; false: string };
  className?: string;
}

/**
 * Reusable badge that renders a boolean value with the correct colour.
 *
 * @example
 *   <BooleanBadge value={user.verified} />
 *   <BooleanBadge value={isHidden} labels={{ true: "Hidden", false: "Visible" }} />
 */
export function BooleanBadge({ value, labels, className }: BooleanBadgeProps) {
  const colors = getBooleanBadgeColors(value);
  const label = labels
    ? value
      ? labels.true
      : labels.false
    : value
      ? BOOLEAN_BADGE_LABELS.true
      : BOOLEAN_BADGE_LABELS.false;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
        colors.bg,
        colors.text,
        colors.ring,
        className,
      )}
    >
      {label}
    </span>
  );
}
