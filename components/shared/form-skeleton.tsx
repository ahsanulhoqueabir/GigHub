import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FormField {
  /** Label width as percentage (e.g. 40 = 40%) */
  labelWidth?: number;
  /** Input width as percentage (e.g. 100 = full width) */
  inputWidth?: number;
  /** Input height in pixels */
  inputHeight?: number;
  /** Number of lines for a textarea-like field */
  textareaLines?: number;
  /** Type of field for realistic skeleton */
  type?: "input" | "textarea" | "select" | "switch" | "combobox";
}

interface FormSkeletonProps {
  /** Number of form fields to show */
  fields?: number;
  /** Number of columns (1 or 2) */
  columns?: number;
  /** Custom field configuration */
  fieldConfig?: FormField[];
  /** Show the form header with title and buttons */
  showHeader?: boolean;
  /** Show the submit button area */
  showFooter?: boolean;
  /** Optional className */
  className?: string;
}

export function FormSkeleton({
  fields = 4,
  columns = 1,
  fieldConfig,
  showHeader = true,
  showFooter = true,
  className,
}: FormSkeletonProps) {
  const defaultField = (index: number): FormField => {
    const configs: FormField[] = [
      { labelWidth: 30, inputWidth: 100, inputHeight: 10 },
      { labelWidth: 25, inputWidth: 80, inputHeight: 10 },
      { labelWidth: 35, inputWidth: 60, inputHeight: 10 },
      {
        labelWidth: 20,
        inputWidth: 100,
        inputHeight: 24,
        type: "textarea",
        textareaLines: 3,
      },
      { labelWidth: 30, inputWidth: 50, inputHeight: 10, type: "select" },
      { labelWidth: 25, inputWidth: 40, inputHeight: 10 },
    ];
    return configs[index % configs.length];
  };

  const itemsPerRow = columns;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-start">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      )}

      {/* Form card */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-5 border-b">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56 mt-1" />
        </div>

        {/* Form fields */}
        <div className="px-6 py-5">
          <div
            className={cn(
              "grid gap-x-6 gap-y-6",
              columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
            )}
          >
            {Array.from({ length: fields }).map((_, index) => {
              const cfg = fieldConfig?.[index] ?? defaultField(index);
              const rowIndex = Math.floor(index / itemsPerRow);
              const isLastRowPartial = (rowIndex + 1) * itemsPerRow > fields;
              const colIndex = index % itemsPerRow;

              return (
                <div
                  key={index}
                  className={cn(
                    "space-y-2",
                    columns === 2 &&
                      !isLastRowPartial &&
                      colIndex === 0 &&
                      "sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-x-6",
                  )}
                >
                  {/* Label */}
                  <Skeleton
                    className="h-4 rounded"
                    style={{ width: `${cfg.labelWidth ?? 30}%` }}
                  />

                  {/* Input */}
                  {cfg.type === "textarea" ? (
                    <div className="space-y-2">
                      {Array.from({ length: cfg.textareaLines ?? 3 }).map(
                        (_, lineIdx) => (
                          <Skeleton
                            key={lineIdx}
                            className="h-4 rounded"
                            style={{
                              width:
                                lineIdx === (cfg.textareaLines ?? 3) - 1
                                  ? "40%"
                                  : "100%",
                            }}
                          />
                        ),
                      )}
                    </div>
                  ) : cfg.type === "switch" ? (
                    <div className="flex items-center gap-3 pt-1">
                      <Skeleton className="h-6 w-10 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ) : cfg.type === "select" || cfg.type === "combobox" ? (
                    <Skeleton
                      className="rounded-md"
                      style={{
                        width: `${cfg.inputWidth ?? 100}%`,
                        height: cfg.inputHeight ?? 10,
                        minHeight: 40,
                      }}
                    />
                  ) : (
                    <Skeleton
                      className="rounded-md"
                      style={{
                        width: `${cfg.inputWidth ?? 100}%`,
                        height: cfg.inputHeight ?? 10,
                        minHeight: 40,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer with submit button */}
      {showFooter && (
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      )}
    </div>
  );
}
