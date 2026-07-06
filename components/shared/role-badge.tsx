import { cn } from "@/lib/utils";
import { getRoleBadgeColors } from "@/lib/shared/badge.utils";

export interface RoleBadgeProps {
  role: string;
  className?: string;
}

/**
 * Reusable badge that renders a `UserRole` value with the correct colour.
 *
 * @example
 *   <RoleBadge role={user.role} />
 */
export function RoleBadge({ role, className }: RoleBadgeProps) {
  const colors = getRoleBadgeColors(role);

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
      {role}
    </span>
  );
}
