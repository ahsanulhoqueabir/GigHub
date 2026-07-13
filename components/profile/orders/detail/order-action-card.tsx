import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconCircleCheck, IconLoader2, IconX } from "@tabler/icons-react";

interface OrderActionCardProps {
  canAccept: boolean;
  canCancel: boolean;
  isAccepting: boolean;
  isCancelling: boolean;
  onAccept: () => void;
  onCancelClick: () => void;
}

export function OrderActionCard({
  canAccept,
  canCancel,
  isAccepting,
  isCancelling,
  onAccept,
  onCancelClick,
}: OrderActionCardProps) {
  if (!canAccept && !canCancel) return null;

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {canAccept && (
            <div className="flex-1 w-full">
              <Button
                className="w-full"
                onClick={onAccept}
                disabled={isAccepting || isCancelling}
              >
                {isAccepting ? (
                  <IconLoader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <IconCircleCheck className="size-4 mr-2" />
                )}
                Accept Order
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Accept this order to transition it to ACTIVE.
              </p>
            </div>
          )}

          {canCancel && (
            <div className="flex-1 w-full">
              <Button
                variant="destructive"
                className="w-full"
                onClick={onCancelClick}
                disabled={isAccepting || isCancelling}
              >
                <IconX className="size-4 mr-2" />
                Cancel Order
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Cancel this order if you cannot proceed.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
