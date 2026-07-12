import { IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { ActionButtons } from "./ActionButtons";
import { ColumnConfig, ActionConfig } from "./types";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  loading?: boolean;
  error?: string | null;
  selectedItems?: string[];
  onToggleSelection?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  onSort?: (field: string, direction: "asc" | "desc") => void;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc";
  actions?: ActionConfig<T>;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  error = null,
  selectedItems = [],
  onToggleSelection,
  onSelectAll,
  onSort,
  sortBy,
  sortDirection = "asc",
  actions,
  onEdit,
  onDelete,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const hasSelection =
    onToggleSelection !== undefined && actions?.bulk?.enableSelection === true;
  const hasActions = !!(
    onEdit !== undefined ||
    onDelete !== undefined ||
    (actions &&
      (!!actions.default?.length ||
        !!actions.additional?.length ||
        !!actions.pageActions?.length))
  );

  // Handle sort click
  const handleSort = (columnKey: string) => {
    if (!onSort) return;

    const newDirection =
      sortBy === columnKey && sortDirection === "asc" ? "desc" : "asc";
    onSort(columnKey, newDirection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (!onSelectAll) return;

    const allIds = data.map((item) => String(item.id));
    const isAllSelected =
      selectedItems.length === data.length &&
      allIds.every((id) => selectedItems.includes(id));

    onSelectAll(isAllSelected ? [] : allIds);
  };

  // Calculate column widths proportionally
  const totalCustomWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);
  const actionColumnWidth = hasActions ? 8 : 0;
  const selectionColumnWidth = hasSelection ? 4 : 0;
  const contentColumnWidth = 100 - actionColumnWidth - selectionColumnWidth;

  const adjustedColumns = columns.map((col) => {
    const relativeWidth = totalCustomWidth > 0
      ? ((col.width || 0) / totalCustomWidth) * contentColumnWidth
      : contentColumnWidth / columns.length;
    return {
      ...col,
      width: relativeWidth,
    };
  });

  if (loading) {
    return (
      <TableSkeleton
        rows={5}
        columns={columns.length}
        columnWidths={columns.map((c) => c.width)}
        hasSelection={hasSelection}
        hasActions={hasActions}
        columnConfig={columns.map((col) => {
          const colIndex = columns.indexOf(col);
          const isFirst = colIndex === 0;
          return {
            width: isFirst ? 40 : 60,
            height: 16,
            align: col.className?.includes("text-left")
              ? "left"
              : col.className?.includes("text-right")
                ? "right"
                : isFirst
                  ? "left"
                  : "center",
          };
        })}
      />
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 p-8 text-center bg-destructive/5">
        <div className="text-destructive font-medium">Error</div>
        <div className="text-sm text-muted-foreground mt-1">{error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border/80 p-8 text-center bg-card">
        <div className="text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 shadow-sm overflow-hidden bg-card">
      <Table className="border-collapse">
        <TableHeader className="bg-muted/40 border-b border-border/60">
          <TableRow className="hover:bg-transparent">
            {/* Selection Column */}
            {hasSelection && (
              <TableHead
                style={{ width: `${selectionColumnWidth}%` }}
                className="w-12 text-center p-3"
              >
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={
                      selectedItems.length === data.length && data.length > 0
                        ? true
                        : selectedItems.length > 0
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </div>
              </TableHead>
            )}

            {/* Data Columns */}
            {adjustedColumns.map((column, index) => {
              const isSortable = column.sortable && onSort;
              const alignClass = column.className?.includes("text-right")
                ? "text-right"
                : column.className?.includes("text-center")
                  ? "text-center"
                  : "text-left";
              return (
                <TableHead
                  key={index}
                  style={{
                    width: column.width ? `${column.width}%` : undefined,
                    minWidth: column.width ? `${column.width * 8}px` : "100px",
                  }}
                  className={cn(
                    "p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 transition-colors select-none",
                    isSortable && "cursor-pointer hover:bg-muted/30 hover:text-foreground",
                    alignClass,
                  )}
                  onClick={isSortable ? () => handleSort(column.key as string) : undefined}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      alignClass === "text-right"
                        ? "justify-end"
                        : alignClass === "text-center"
                          ? "justify-center"
                          : "justify-start",
                    )}
                  >
                    <span>{column.label}</span>
                    {isSortable && (
                      <div className="flex flex-col shrink-0 text-muted-foreground/45">
                        <IconChevronUp
                          className={cn(
                            "h-3 w-3 -mb-0.5 transition-all",
                            sortBy === column.key && sortDirection === "asc"
                              ? "text-primary opacity-100 scale-110"
                              : "opacity-50"
                          )}
                        />
                        <IconChevronDown
                          className={cn(
                            "h-3 w-3 transition-all",
                            sortBy === column.key && sortDirection === "desc"
                              ? "text-primary opacity-100 scale-110"
                              : "opacity-50"
                          )}
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              );
            })}

            {/* Actions Column */}
            {hasActions && (
              <TableHead
                style={{ width: `${actionColumnWidth}%` }}
                className="w-20 text-right p-3 pr-6 text-xs uppercase tracking-wider font-semibold text-muted-foreground/80"
              >
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow
              key={String(item.id)}
              className="border-b border-border/40 hover:bg-muted/30 transition-colors"
            >
              {/* Selection Cell */}
              {hasSelection && (
                <TableCell className="w-12 text-center p-3">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={selectedItems.includes(String(item.id))}
                      onCheckedChange={() => onToggleSelection?.(String(item.id))}
                    />
                  </div>
                </TableCell>
              )}

              {/* Data Cells */}
              {adjustedColumns.map((column, colIndex) => {
                const alignClass = column.className?.includes("text-right")
                  ? "text-right"
                  : column.className?.includes("text-center")
                    ? "text-center"
                    : "text-left";
                return (
                  <TableCell
                    key={colIndex}
                    style={{
                      width: column.width ? `${column.width}%` : undefined,
                      minWidth: column.width ? `${column.width * 8}px` : "100px",
                    }}
                    className={cn(
                      "p-3.5 align-middle text-sm transition-colors",
                      alignClass,
                      column.className,
                    )}
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || "")}
                  </TableCell>
                );
              })}

              {/* Actions Cell */}
              {hasActions && (
                <TableCell className="w-20 text-right p-3 pr-6">
                  <div className="flex justify-end">
                    <ActionButtons
                      item={item}
                      actions={actions}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
