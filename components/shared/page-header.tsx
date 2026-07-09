"use client";

import { BackButton } from "@/components/ui/back-button";
import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Back button href */
  backHref: string;
  /** Page title — can be a string or a ReactNode (e.g. title with a badge) */
  title: ReactNode;
  /** Optional description/subtitle */
  description?: string;
  /** Optional action buttons rendered on the right side */
  actions?: ReactNode;
}

export function PageHeader({
  backHref,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <BackButton href={backHref} />
        <div className="min-w-0">
          <h2 className="text-lg md:text-2xl font-bold tracking-tight text-foreground truncate">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground text-xs sm:text-sm text-wrap">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-stretch sm:items-center gap-3 w-full sm:w-auto *:flex-1 sm:*:flex-none">
          {actions}
        </div>
      )}
    </div>
  );
}
