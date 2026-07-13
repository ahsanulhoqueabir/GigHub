import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconReceipt2 } from "@tabler/icons-react";
import { InfoRow } from "./order-info-row";
import { SectionLabel } from "./order-section-label";

interface OrderDetailsCardProps {
  totalPrice: number;
  amount: number;
  symbol: string;
  description?: string | null;
  note?: string | null;
  title?: string;
}

export function OrderDetailsCard({
  totalPrice,
  amount,
  symbol,
  description,
  note,
  title,
}: OrderDetailsCardProps) {
  return (
    <Card className="space-y-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <IconReceipt2 className="size-4 text-primary" />
            </div>
            Order Details
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg md:text-xl font-medium">{title}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow
            icon={IconReceipt2}
            label="Total Price"
            value={
              <span className="font-semibold text-primary">
                {symbol} {totalPrice}
              </span>
            }
          />
          <InfoRow
            icon={IconReceipt2}
            label="Amount"
            value={
              <span className="font-semibold text-primary">
                {symbol} {amount}
              </span>
            }
          />
        </div>

        {description && (
          <div>
            <SectionLabel>Description</SectionLabel>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mt-1">
              {description}
            </p>
          </div>
        )}

        {note && (
          <div>
            <SectionLabel>Note</SectionLabel>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mt-1">
              {note}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
