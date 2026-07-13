"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/use-currency";
import { getStatusBadgeColors } from "@/lib/shared/badge.utils";
import type { OrderListItem } from "@/store/orders.store";
import { IconEye } from "@tabler/icons-react";
import { formatShortDate } from "@/lib/date.utils";

interface OrderManageCardProps {
  order: OrderListItem;
  onViewDetails?: (id: string) => void;
}

export function OrderManageCard({ order, onViewDetails }: OrderManageCardProps) {
  const { symbol } = useCurrency();
  const statusColors = getStatusBadgeColors(order.status);
  
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-primary uppercase">{order.code}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {order.source}
            </Badge>
          </div>
          <h3 className="font-medium text-sm line-clamp-2">{order.title}</h3>
        </div>

        <Badge
          className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text} ${statusColors.ring}`}
        >
          {order.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="font-semibold">
          {symbol} {order.total_price}
        </div>
        <div className="text-muted-foreground">
          {formatShortDate(order.created_at)}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewDetails?.(order.id)}
          className="gap-1.5 text-xs h-8"
        >
          <IconEye size={14} />
          Details
        </Button>
      </div>
    </div>
  );
}
