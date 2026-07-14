import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";

interface DisputeOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  isDisputing: boolean;
  onConfirm: () => void;
}

export function DisputeOrderDialog({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  isDisputing,
  onConfirm,
}: DisputeOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise a Dispute</DialogTitle>
          <DialogDescription>
            You are about to dispute this order. An admin will review your case
            and make a decision. Please provide a clear reason for your dispute.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Describe why you are disputing this order (required)..."
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={5}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {reason.length} / 1000
          </p>
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDisputing}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!reason.trim() || isDisputing}
          >
            {isDisputing ? (
              <>
                <IconLoader2 className="size-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <IconAlertTriangle className="size-4 mr-2" />
                Submit Dispute
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
