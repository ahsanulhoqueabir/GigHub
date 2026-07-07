import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  /** Number of skeleton rows to display */
  rows?: number;
  /** Number of columns (auto-detected if columns array provided) */
  columns?: number;
  /** Column width percentages (e.g. [40, 40, 20]) */
  columnWidths?: number[];
  /** Show selection checkbox column */
  hasSelection?: boolean;
  /** Show action buttons column */
  hasActions?: boolean;
  /** Show header row */
  showHeader?: boolean;
  /** Optional className for the wrapper */
  className?: string;
  /** Variant of skeleton to render */
  variant?: "table" | "card" | "list";
  /** Custom column config for more realistic skeletons */
  columnConfig?: {
    /** Width of the skeleton bar as percentage of the cell (e.g. 60 = 60%) */
    width?: number;
    /** Height of the skeleton bar */
    height?: number;
    /** Alignment: "left" | "center" | "right" */
    align?: "left" | "center" | "right";
  }[];
}

export function TableSkeleton({
  rows = 5,
  columns = 3,
  columnWidths,
  hasSelection = false,
  hasActions = false,
  showHeader = true,
  className,
  variant = "table",
  columnConfig,
}: TableSkeletonProps) {
  if (variant === "card") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="p-5 border border-border/80 rounded-xl bg-card space-y-3"
          >
            {/* Card title skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-16" />
            </div>
            {/* Card subtitle skeleton */}
            <Skeleton className="h-4 w-2/3" />
            {/* Card description skeleton */}
            <Skeleton className="h-4 w-full" />
            {/* Card actions skeleton */}
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="flex items-center gap-4 p-4 border border-border/60 rounded-lg bg-card"
          >
            {hasSelection && <Skeleton className="h-4 w-4 shrink-0" />}
            {Array.from({ length: columns }).map((_, colIdx) => {
              const cfg = columnConfig?.[colIdx];
              return (
                <Skeleton
                  key={colIdx}
                  className="h-4"
                  style={{
                    width: `${cfg?.width ?? 25}%`,
                    height: cfg?.height ?? 16,
                    marginLeft:
                      cfg?.align === "right"
                        ? "auto"
                        : cfg?.align === "center"
                          ? "auto"
                          : undefined,
                    marginRight: cfg?.align === "center" ? "auto" : undefined,
                  }}
                />
              );
            })}
            {hasActions && (
              <div className="flex items-center gap-1 ml-auto shrink-0">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Default: table variant
  const totalColumns = columns + (hasSelection ? 1 : 0) + (hasActions ? 1 : 0);

  return (
    <div className={cn("rounded-md border", className)}>
      {/* Screen reader accessible table */}
      <div role="table" aria-label="Loading data" className="w-full">
        {/* Header */}
        {showHeader && (
          <div role="row" className="flex border-b bg-muted/30">
            {hasSelection && (
              <div
                role="columnheader"
                className="p-3 flex items-center"
                style={{ width: "5%" }}
              >
                <Skeleton className="h-4 w-4" />
              </div>
            )}
            {Array.from({ length: columns }).map((_, colIdx) => {
              const width = columnWidths?.[colIdx]
                ? `${(columnWidths[colIdx] / 100) * (100 - (hasSelection ? 5 : 0) - (hasActions ? 10 : 0))}%`
                : `${100 / totalColumns}%`;
              return (
                <div
                  key={colIdx}
                  role="columnheader"
                  className="p-3"
                  style={{ width }}
                >
                  <Skeleton className="h-4 w-20" />
                </div>
              );
            })}
            {hasActions && (
              <div
                role="columnheader"
                className="p-3"
                style={{ width: "10%" }}
              ></div>
            )}
          </div>
        )}

        {/* Body rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            role="row"
            className={cn(
              "flex border-b last:border-b-0",
              rowIdx % 2 === 0 ? "bg-background" : "bg-muted/10",
            )}
          >
            {hasSelection && (
              <div className="p-3 flex items-center" style={{ width: "5%" }}>
                <Skeleton className="h-4 w-4" />
              </div>
            )}
            {Array.from({ length: columns }).map((_, colIdx) => {
              const cfg = columnConfig?.[colIdx];
              const skeletonWidth = cfg?.width ?? 60;
              const skeletonHeight = cfg?.height ?? 16;
              const width = columnWidths?.[colIdx]
                ? `${(columnWidths[colIdx] / 100) * (100 - (hasSelection ? 5 : 0) - (hasActions ? 10 : 0))}%`
                : `${100 / totalColumns}%`;

              return (
                <div
                  key={colIdx}
                  className="p-3 flex items-center"
                  style={{ width }}
                >
                  <div
                    className={cn(
                      "flex",
                      cfg?.align === "right"
                        ? "justify-end w-full"
                        : cfg?.align === "center"
                          ? "justify-center w-full"
                          : "justify-start",
                    )}
                  >
                    <Skeleton
                      className="rounded"
                      style={{
                        width: `${skeletonWidth}%`,
                        height: skeletonHeight,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {hasActions && (
              <div
                className="p-3 flex items-center gap-1"
                style={{ width: "10%" }}
              >
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
