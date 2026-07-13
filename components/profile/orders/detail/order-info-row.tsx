interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
}

export function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-md bg-muted shrink-0">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium mt-0.5 wrap-break-word">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}
