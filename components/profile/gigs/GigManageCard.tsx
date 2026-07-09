"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/use-currency";
import { getStatusBadgeColors } from "@/lib/shared/badge.utils";
import type { GigListItem } from "@/types/db/gig.types";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import Image from "next/image";

interface GigManageCardProps {
  gig: GigListItem;
  onEdit?: (gig: GigListItem) => void;
  onDelete?: (id: string) => void;
  onDetails?: (gig: GigListItem) => void;
}

export function GigManageCard({
  gig,
  onEdit,
  onDelete,
  onDetails,
}: GigManageCardProps) {
  const { symbol } = useCurrency();

  const primaryImage =
    gig.images && gig.images.length > 0 ? gig.images[0] : null;

  const prices = gig.packages
    .map((p) => p.price)
    .filter((p): p is number => typeof p === "number");
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  const status = (gig as GigListItem & { status?: string }).status || "ACTIVE";
  const statusColors = getStatusBadgeColors(status);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Top row: image + title + status */}
      <div className="flex items-start gap-3">
        {/* Image */}
        <div className="shrink-0">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={gig.title}
              className="w-16 h-12 rounded object-cover border border-border"
              height={48}
              width={64}
            />
          ) : (
            <div className="w-16 h-12 rounded bg-muted border border-border flex items-center justify-center text-[10px] text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        {/* Title + Category */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2">{gig.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {gig.category?.name || "N/A"}
          </p>
        </div>

        {/* Status badge */}
        <Badge
          className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text} ${statusColors.ring}`}
        >
          {status}
        </Badge>
      </div>

      {/* Price + Views */}
      <div className="flex items-center justify-between text-xs">
        <div className="font-semibold">
          {minPrice !== null && maxPrice !== null
            ? minPrice === maxPrice
              ? `${symbol} ${minPrice}`
              : `${symbol} ${minPrice} - ${symbol} ${maxPrice}`
            : "N/A"}
        </div>
        <div className="text-muted-foreground">{gig.views} views</div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        {onDetails && (
          <Button
            className="flex-1"
            variant="accent"
            size="sm"
            onClick={() => onDetails(gig)}
          >
            <IconEye size={14} />
            Details
          </Button>
        )}
        {onEdit && (
          <Button
            className="flex-1"
            variant="refresh"
            size="sm"
            onClick={() => onEdit(gig)}
          >
            <IconEdit size={14} />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            className="flex-1"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(gig.id)}
          >
            <IconTrash size={14} />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
