import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import type { ReactNode } from "react";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ErrorStateProps {
  /**
   * The error message to display.
   * When omitted, defaults are used based on `type`.
   */
  message?: string | null;

  /**
   * Error type — controls the default icon, heading, and message.
   * - `"error"` (default): "Something went wrong"
   * - `"not-found"`: "Not found"
   * - `"access-denied"`: "Access denied"
   */
  type?: "error" | "not-found" | "access-denied";

  /**
   * Override the default heading.
   */
  heading?: string;

  /**
   * Override the default icon component.
   */
  icon?: ReactNode;

  /**
   * Callback for the "Retry" button. Omit to hide the retry button.
   */
  onRetry?: () => void;

  /**
   * Callback for the "Go Back" button. Omit to hide the back button.
   * When omitted, no back button is shown.
   */
  onBack?: () => void;

  /**
   * Custom action buttons rendered after the default back/retry buttons.
   */
  actions?: ReactNode;

  /**
   * Optional className for the wrapper.
   */
  className?: string;

  /**
   * Compact variant — smaller padding and font sizes.
   * Useful for inline / card-level errors.
   */
  compact?: boolean;
}

// ─── Defaults per type ────────────────────────────────────────────────────────

const DEFAULTS: Record<
  NonNullable<ErrorStateProps["type"]>,
  {
    icon: ReactNode;
    heading: string;
    defaultMessage: string;
  }
> = {
  error: {
    icon: (
      <div className="p-4 rounded-full bg-destructive/10">
        <IconAlertTriangle className="size-8 text-destructive" />
      </div>
    ),
    heading: "Something went wrong",
    defaultMessage: "An unexpected error occurred. Please try again.",
  },
  "not-found": {
    icon: (
      <div className="p-4 rounded-full bg-muted">
        <IconAlertTriangle className="size-8 text-muted-foreground" />
      </div>
    ),
    heading: "Not found",
    defaultMessage: "The requested resource could not be found.",
  },
  "access-denied": {
    icon: (
      <div className="p-4 rounded-full bg-destructive/10">
        <IconAlertTriangle className="size-8 text-destructive" />
      </div>
    ),
    heading: "Access denied",
    defaultMessage: "You don't have permission to view this page.",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A reusable, extensible error state component for full-page or inline errors.
 *
 * @example
 *   // Simple error with retry
 *   <ErrorState message={error} onRetry={refetch} onBack={() => router.back()} />
 *
 * @example
 *   // Not-found with custom heading and actions
 *   <ErrorState
 *     type="not-found"
 *     heading="Gig not found"
 *     message="This gig may have been deleted."
 *     onBack={() => router.back()}
 *     actions={<Button onClick={() => router.push("/gigs")}>Browse Gigs</Button>}
 *   />
 *
 * @example
 *   // Compact inline error
 *   <ErrorState type="error" compact message="Failed to load data." onRetry={refetch} />
 */
export function ErrorState({
  message,
  type = "error",
  heading,
  icon,
  onRetry,
  onBack,
  actions,
  className = "",
  compact = false,
}: ErrorStateProps) {
  const defaults = DEFAULTS[type];

  const resolvedIcon = icon ?? defaults.icon;
  const resolvedHeading = heading ?? defaults.heading;
  const resolvedMessage =
    message !== undefined && message !== null
      ? message
      : defaults.defaultMessage;

  if (compact) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 gap-3 text-center ${className}`}
      >
        <div className="p-3 rounded-full bg-destructive/10">
          <IconAlertTriangle className="size-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{resolvedHeading}</h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            {resolvedMessage}
          </p>
        </div>
        <div className="flex gap-2 mt-1">
          {onBack && <BackButton onClick={onBack} />}
          {onRetry && (
            <Button onClick={onRetry} size="sm">
              <IconRefresh size={14} />
              Retry
            </Button>
          )}
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
        <h2 className="font-semibold text-lg">{resolvedHeading}</h2>
        <p className="text-muted-foreground text-sm mt-1">{resolvedMessage}</p>
      </div>
      <div className="flex gap-2">
        {onBack && <BackButton onClick={onBack} />}
        {onRetry && (
          <Button onClick={onRetry} size="sm">
            <IconRefresh size={14} />
            Retry
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}
