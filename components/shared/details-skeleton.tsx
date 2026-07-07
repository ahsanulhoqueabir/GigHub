import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DetailRow {
  /** Label width as percentage */
  labelWidth?: number;
  /** Value width as percentage */
  valueWidth?: number;
  /** Whether this row spans full width */
  fullWidth?: boolean;
}

interface DetailsSkeletonProps {
  /** Number of detail rows to show */
  rows?: number;
  /** Number of columns (1 or 2) */
  columns?: number;
  /** Show the page header with back button, title, and action buttons */
  showHeader?: boolean;
  /** Show the card header (section title) */
  showCardHeader?: boolean;
  /** Custom row configuration */
  rowConfig?: DetailRow[];
  /** Optional className */
  className?: string;
}

export function DetailsSkeleton({
  rows = 4,
  columns = 2,
  showHeader = true,
  showCardHeader = true,
  rowConfig,
  className,
}: DetailsSkeletonProps) {
  const defaultRow = (index: number): DetailRow => {
    const configs: DetailRow[] = [
      { labelWidth: 25, valueWidth: 40 },
      { labelWidth: 25, valueWidth: 55 },
      { labelWidth: 30, valueWidth: 35 },
      { labelWidth: 20, valueWidth: 60, fullWidth: true },
      { labelWidth: 25, valueWidth: 45 },
      { labelWidth: 30, valueWidth: 50 },
    ];
    return configs[index % configs.length];
  };

  return (
    <div className={cn("flex-1 space-y-6", className)}>
      {/* Page header */}
      {showHeader && (
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
      )}

      {/* Details card */}
      <div className="max-w-3xl">
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          {/* Card header */}
          {showCardHeader && (
            <div className="px-6 py-5 border-b bg-muted/20">
              <Skeleton className="h-5 w-44" />
              {columns > 1 && <Skeleton className="h-4 w-60 mt-1" />}
            </div>
          )}

          {/* Detail rows */}
          <div className="px-6 py-5">
            <dl
              className={cn(
                "grid gap-x-4 gap-y-8",
                columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
              )}
            >
              {Array.from({ length: rows }).map((_, index) => {
                const cfg = rowConfig?.[index] ?? defaultRow(index);

                if (cfg.fullWidth && columns === 2) {
                  return (
                    <div key={index} className="sm:col-span-2 space-y-1.5">
                      <Skeleton
                        className="h-4 rounded"
                        style={{ width: `${cfg.labelWidth ?? 25}%` }}
                      />
                      <Skeleton
                        className="h-4 rounded"
                        style={{ width: `${cfg.valueWidth ?? 60}%` }}
                      />
                    </div>
                  );
                }

                return (
                  <div key={index} className="space-y-1.5">
                    <Skeleton
                      className="h-4 rounded"
                      style={{ width: `${cfg.labelWidth ?? 25}%` }}
                    />
                    <Skeleton
                      className="h-4 rounded"
                      style={{ width: `${cfg.valueWidth ?? 50}%` }}
                    />
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
