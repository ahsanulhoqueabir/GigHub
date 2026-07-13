import { IconAlertTriangle } from "@tabler/icons-react";

interface OrderActionErrorProps {
  message: string | null;
}

export function OrderActionError({ message }: OrderActionErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
      <IconAlertTriangle className="size-4 mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
