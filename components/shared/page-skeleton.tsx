import { DetailsSkeleton } from "@/components/shared/details-skeleton";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Page Skeleton ───────────────────────────────────────────────────────────
// A unified skeleton loader for full pages. Use inside <Suspense> fallback.
// Automatically mimics the page layout: header + content area.

interface PageSkeletonBase {
  /** Optional className for the wrapper */
  className?: string;
}

// ─── Form Page (Create/Edit) ────────────────────────────────────────────────

interface FormPageSkeletonProps extends PageSkeletonBase {
  variant: "form";
  /** Number of form fields */
  fields?: number;
  /** Number of columns (1 or 2) */
  columns?: number;
}

// ─── Details Page ───────────────────────────────────────────────────────────

interface DetailsPageSkeletonProps extends PageSkeletonBase {
  variant: "details";
  /** Number of detail rows */
  rows?: number;
  /** Number of columns (1 or 2) */
  columns?: number;
}

// ─── Table/List Page ────────────────────────────────────────────────────────

interface ListPageSkeletonProps extends PageSkeletonBase {
  variant: "list";
  /** Number of skeleton rows */
  rows?: number;
  /** Show as cards (for mobile-friendly layouts) */
  asCards?: boolean;
}

// ─── Generic / Default ──────────────────────────────────────────────────────

interface DefaultPageSkeletonProps extends PageSkeletonBase {
  variant?: "default";
}

type PageSkeletonProps =
  | FormPageSkeletonProps
  | DetailsPageSkeletonProps
  | ListPageSkeletonProps
  | DefaultPageSkeletonProps;

export function PageSkeleton(props: PageSkeletonProps) {
  const { variant = "default", className } = props;

  if (variant === "form") {
    const { fields = 6, columns = 1 } = props as FormPageSkeletonProps;
    return (
      <div className={cn("flex-1", className)}>
        <FormSkeleton fields={fields} columns={columns} showHeader showFooter />
      </div>
    );
  }

  if (variant === "details") {
    const { rows = 4, columns = 2 } = props as DetailsPageSkeletonProps;
    return (
      <div className={cn("flex-1", className)}>
        <DetailsSkeleton
          rows={rows}
          columns={columns}
          showHeader
          showCardHeader
        />
      </div>
    );
  }

  if (variant === "list") {
    const { rows = 5, asCards = true } = props as ListPageSkeletonProps;
    return (
      <div className={cn("flex-1 space-y-6", className)}>
        {/* Page header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>

        {/* Table/card skeleton */}
        <TableSkeleton
          rows={rows}
          variant={asCards ? "card" : "table"}
          columns={4}
          hasActions
        />
      </div>
    );
  }

  // Default: simple centered skeleton
  return (
    <div
      className={cn("flex-1 flex items-center justify-center py-20", className)}
    >
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}
