import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconLoader2, IconSend } from "@tabler/icons-react";

interface DeliverOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDelivering: boolean;
  onConfirm: () => void;
}

export function DeliverOrderDialog({
  open,
  onOpenChange,
  isDelivering,
  onConfirm,
}: DeliverOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Delivered</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this order as delivered? Once
            confirmed, the buyer will be able to review and complete the order.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDelivering}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isDelivering}>
            {isDelivering ? (
              <>
                <IconLoader2 className="size-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <IconSend className="size-4 mr-2" />
                Mark as Delivered
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
