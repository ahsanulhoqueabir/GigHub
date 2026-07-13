import { StatusBadge } from "@/components/shared/status-badge";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateInTimezone } from "@/lib/date.utils";
import {
  IconCircleCheck,
  IconLoader2,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";

interface OrderDetailHeaderProps {
  code: string;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
  onBack: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  /** Show accept button in header */
  canAccept?: boolean;
  /** Show cancel button in header */
  canCancel?: boolean;
  isAccepting?: boolean;
  isCancelling?: boolean;
  onAcceptClick?: () => void;
  onCancelClick?: () => void;
}

export function OrderDetailHeader({
  code,
  source,
  status,
  created_at,
  updated_at,
  onBack,
  onRefresh,
  isRefreshing,
  canAccept,
  canCancel,
  isAccepting,
  isCancelling,
  onAcceptClick,
  onCancelClick,
}: OrderDetailHeaderProps) {
  const isAnyLoading = isAccepting || isCancelling;

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-sm text-primary uppercase">
              {code}
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {source}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Created on {formatDateInTimezone(created_at)}
            {updated_at !== created_at && (
              <> · Updated {formatDateInTimezone(updated_at)}</>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
        <StatusBadge status={status} />

        {onRefresh && (
          <Button
            variant="refresh"
            onClick={onRefresh}
            disabled={isRefreshing || isAnyLoading}
            title="Refresh"
          >
            <IconRefresh
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        )}

        {canCancel && (
          <Button
            variant="destructive"
            onClick={onCancelClick}
            disabled={isAnyLoading}
          >
            {isCancelling ? (
              <IconLoader2 className="size-4 mr-1.5 animate-spin" />
            ) : (
              <IconX className="size-4 mr-1.5" />
            )}
            Cancel
          </Button>
        )}

        {canAccept && (
          <Button onClick={onAcceptClick} disabled={isAnyLoading}>
            {isAccepting ? (
              <IconLoader2 className="size-4 mr-1.5 animate-spin" />
            ) : (
              <IconCircleCheck className="size-4 mr-1.5" />
            )}
            Accept
          </Button>
        )}
      </div>
    </div>
  );
}
