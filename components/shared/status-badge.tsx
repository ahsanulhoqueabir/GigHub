import { cn } from "@/lib/utils";
import { getStatusBadgeColors } from "@/lib/shared/badge.utils";

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Reusable badge that renders any `Status` value with the correct colour.
 *
 * @example
 *   <StatusBadge status={gig.status} />
 *   <StatusBadge status="ACTIVE" className="text-xs" />
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = getStatusBadgeColors(status);

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
      {status}
    </span>
  );
}
