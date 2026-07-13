import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date.utils";
import { IconAlertTriangle } from "@tabler/icons-react";
import { SectionLabel } from "./order-section-label";

interface OrderCancellationCardProps {
  reason?: string | null;
  cancelledAt?: string | null;
}

export function OrderCancellationCard({
  reason,
  cancelledAt,
}: OrderCancellationCardProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-destructive">
          <div className="p-1.5 rounded-md bg-destructive/10">
            <IconAlertTriangle className="size-4" />
          </div>
          Cancellation Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <SectionLabel>Reason</SectionLabel>
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
            {reason || "No reason provided"}
          </p>
        </div>
        {cancelledAt && (
          <div>
            <SectionLabel>Cancelled At</SectionLabel>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDateTime(cancelledAt)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
