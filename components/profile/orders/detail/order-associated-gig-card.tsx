import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderGigInfo } from "@/store/orders.store";
import { IconBriefcase } from "@tabler/icons-react";
import { OrderGigPackageCard } from "./order-gig-package-card";
import { SectionLabel } from "./order-section-label";

interface OrderAssociatedGigCardProps {
  gig: OrderGigInfo;
  packageTier?: string | null;
  symbol: string;
}

export function OrderAssociatedGigCard({
  gig,
  packageTier,
  symbol,
}: OrderAssociatedGigCardProps) {
  const selectedPkg = gig.packages?.find((p) => p.tier === packageTier);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <IconBriefcase className="size-4 text-primary" />
            </div>
            Associated Gig
          </CardTitle>
          <Button asChild>
            <a
              href={`/gigs/${gig.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Gig
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <SectionLabel>Title</SectionLabel>
          <p className="text-sm font-medium mt-1">{gig.title}</p>
        </div>

        {gig.description && (
          <div>
            <SectionLabel>Description</SectionLabel>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-1">
              {gig.description}
            </p>
          </div>
        )}

        {selectedPkg && (
          <OrderGigPackageCard pkg={selectedPkg} symbol={symbol} />
        )}
      </CardContent>
    </Card>
  );
}
