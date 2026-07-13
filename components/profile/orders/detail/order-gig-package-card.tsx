import { Badge } from "@/components/ui/badge";
import type { OrderGigInfo } from "@/store/orders.store";
import { IconCircleCheck } from "@tabler/icons-react";
import { SectionLabel } from "./order-section-label";

interface OrderGigPackageCardProps {
  pkg: NonNullable<OrderGigInfo["packages"]>[number];
  symbol: string;
}

export function OrderGigPackageCard({ pkg, symbol }: OrderGigPackageCardProps) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel>Selected Package</SectionLabel>
        <Badge variant="secondary" className="text-xs font-semibold uppercase">
          {pkg.tier}
        </Badge>
      </div>
      <div>
        <p className="text-base font-bold">{pkg.title}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="text-lg font-bold text-primary">
            {symbol} {pkg.price ?? 0}
          </p>
        </div>
        {pkg.delivery_days && (
          <div>
            <p className="text-xs text-muted-foreground">Delivery</p>
            <p className="text-sm font-medium">
              {pkg.delivery_days} day{pkg.delivery_days > 1 ? "s" : ""}
            </p>
          </div>
        )}
        {pkg.revisions && (
          <div>
            <p className="text-xs text-muted-foreground">Revisions</p>
            <p className="text-sm font-medium">{pkg.revisions}</p>
          </div>
        )}
      </div>
      {pkg.description && (
        <div>
          <p className="text-xs text-muted-foreground">Description</p>
          <p className="text-sm text-foreground/80 mt-0.5">{pkg.description}</p>
        </div>
      )}
      {pkg.features && pkg.features.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Features</p>
          <ul className="space-y-1">
            {pkg.features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-foreground/80"
              >
                <IconCircleCheck className="size-3.5 text-primary mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
