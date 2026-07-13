import { Card, CardContent } from "@/components/ui/card";

interface OrderIdCardProps {
  id: string;
}

export function OrderIdCard({ id }: OrderIdCardProps) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-4 pb-3">
        <p className="text-xs text-muted-foreground mb-1">Order ID</p>
        <p className="text-xs font-mono break-all text-foreground/70 select-all">
          {id}
        </p>
      </CardContent>
    </Card>
  );
}
