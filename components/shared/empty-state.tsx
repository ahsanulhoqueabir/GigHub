import { BackButton } from "@/components/ui/back-button";
import { IconInboxOff } from "@tabler/icons-react";
import type { ReactNode } from "react";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  /**
   * The heading text. Default: "No data found"
   */
  heading?: string;

  /**
   * A longer description explaining why the list is empty.
   */
  description?: string;

  /**
   * Override the default icon component.
   */
  icon?: ReactNode;

  /**
   * Custom action buttons.
   */
  actions?: ReactNode;

  /**
   * Callback for the "Go Back" button. Omit to hide.
   */
  onBack?: () => void;

  /**
   * Optional className for the wrapper.
   */
  className?: string;

  /**
   * Compact variant — smaller padding and font sizes.
   * Useful for inline / card-level empty states.
   */
  compact?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A reusable empty state component for when there is no data to display.
 *
 * @example
 *   // Basic usage
 *   <EmptyState />
 *
 * @example
 *   // Custom message with action
 *   <EmptyState
 *     heading="No proposals yet"
 *     description="When someone applies to your job, it will appear here."
 *     actions={<Button onClick={() => router.push("/jobs/create")}>Post a Job</Button>}
 *   />
 *
 * @example
 *   // Compact inline variant
 *   <EmptyState compact heading="No results" description="Try adjusting your search." />
 */
export function EmptyState({
  heading = "No data found",
  description,
  icon,
  actions,
  onBack,
  className = "",
  compact = false,
}: EmptyStateProps) {
  const resolvedIcon = icon ?? (
    <div className="p-4 rounded-full bg-muted">
      <IconInboxOff className="size-8 text-muted-foreground" />
    </div>
  );

  if (compact) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 gap-3 text-center ${className}`}
      >
        <div className="p-3 rounded-full bg-muted">
          <IconInboxOff className="size-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{heading}</h3>
          {description && (
            <p className="text-muted-foreground text-xs mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="flex gap-2 mt-1">
          {onBack && <BackButton onClick={onBack} />}
          {actions}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center py-24 gap-4 text-center ${className}`}
    >
      {resolvedIcon}
      <div>
        <h2 className="font-semibold text-lg">{heading}</h2>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>
      <div className="flex gap-2">
        {onBack && <BackButton onClick={onBack} />}
        {actions}
      </div>
    </div>
  );
}
