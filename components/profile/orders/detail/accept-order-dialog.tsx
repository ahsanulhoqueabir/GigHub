import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconCircleCheck, IconLoader2 } from "@tabler/icons-react";

interface AcceptOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAccepting: boolean;
  onConfirm: () => void;
}

export function AcceptOrderDialog({
  open,
  onOpenChange,
  isAccepting,
  onConfirm,
}: AcceptOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to accept this order? This will transition the
            order to ACTIVE status and work will begin.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAccepting}
          >
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            onClick={onConfirm}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <>
                <IconLoader2 className="size-4 mr-2 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <IconCircleCheck className="size-4 mr-2" />
                Accept Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
