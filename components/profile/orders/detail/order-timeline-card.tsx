import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date.utils";
import { IconClock } from "@tabler/icons-react";

interface OrderTimelineCardProps {
  created_at: string;
  updated_at: string;
}

export function OrderTimelineCard({
  created_at,
  updated_at,
}: OrderTimelineCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <IconClock className="size-4 text-muted-foreground" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Created At</p>
          <p className="text-sm font-medium mt-0.5">
            {formatDateTime(created_at)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Last Updated</p>
          <p className="text-sm font-medium mt-0.5">
            {formatDateTime(updated_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
