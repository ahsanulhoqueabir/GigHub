"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VisibilityBadgeProps {
  hidden?: boolean | null;
  className?: string;
}

export function VisibilityBadge({ hidden, className }: VisibilityBadgeProps) {
  const isHidden = !!hidden;

  return (
    <Badge
      variant={!isHidden ? "default" : "secondary"}
      className={cn(
        "text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0",
        !isHidden
          ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-slate-500/15 text-slate-600 hover:bg-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400",
        className,
      )}
    >
      {!isHidden ? "Visible" : "Hidden"}
    </Badge>
  );
}
