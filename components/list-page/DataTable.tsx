import { IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
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
  const hasActions =
    onEdit !== undefined ||
    onDelete !== undefined ||
    (actions &&
      (actions.default?.length ||
        actions.additional?.length ||
        actions.pageActions?.length));

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

  // Calculate column widths
  const actionColumnWidth = hasActions ? 10 : 0;
  const selectionColumnWidth = hasSelection ? 5 : 0;
  const contentColumnWidth = 100 - actionColumnWidth - selectionColumnWidth;

  const adjustedColumns = columns.map((col) => ({
    ...col,
    width: (col.width / 100) * contentColumnWidth,
  }));

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {hasSelection && (
                <TableHead
                  style={{ width: `${selectionColumnWidth}%` }}
                ></TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  style={{ width: `${adjustedColumns[index].width}%` }}
                >
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
              {hasActions && (
                <TableHead
                  style={{ width: `${actionColumnWidth}%` }}
                ></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                {hasSelection && (
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                )}
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell>
                    <Skeleton className="h-8 w-20" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border p-8 text-center">
        <div className="text-destructive font-medium">Error</div>
        <div className="text-sm text-muted-foreground mt-1">{error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <div className="text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Selection Column */}
            {hasSelection && (
              <TableHead
                style={{ width: `${selectionColumnWidth}%` }}
                className="w-12"
              >
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
              </TableHead>
            )}

            {/* Data Columns */}
            {adjustedColumns.map((column, index) => (
              <TableHead
                key={index}
                style={{ width: `${column.width}%` }}
                className={column.className}
              >
                <div
                  className={cn(
                    "flex items-center gap-1",
                    {
                      "justify-center": index > 0,
                    },
                    column.className,
                  )}
                >
                  <span>{column.label}</span>
                  {column.sortable && onSort && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent group"
                      onClick={() => handleSort(column.key as string)}
                    >
                      <div className="flex flex-col">
                        <IconChevronUp
                          className={`h-3 w-3 transition-all ${
                            sortBy === column.key && sortDirection === "asc"
                              ? "text-primary opacity-100 scale-110"
                              : "text-muted-foreground opacity-30 group-hover:opacity-60"
                          }`}
                        />
                        <IconChevronDown
                          className={`h-3 w-3 -mt-1 transition-all ${
                            sortBy === column.key && sortDirection === "desc"
                              ? "text-primary opacity-100 scale-110"
                              : "text-muted-foreground opacity-30 group-hover:opacity-60"
                          }`}
                        />
                      </div>
                    </Button>
                  )}
                </div>
              </TableHead>
            ))}

            {/* Actions Column */}
            {hasActions && (
              <TableHead
                style={{ width: `${actionColumnWidth}%` }}
                className="text-left"
              >
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow key={String(item.id)}>
              {/* Selection Cell */}
              {hasSelection && (
                <TableCell className="w-12">
                  <Checkbox
                    checked={selectedItems.includes(String(item.id))}
                    onCheckedChange={() => onToggleSelection?.(String(item.id))}
                  />
                </TableCell>
              )}

              {/* Data Cells */}
              {adjustedColumns.map((column, colIndex) => (
                <TableCell
                  key={colIndex}
                  className={`${column.className || ""} ${colIndex > 0 ? "text-center" : ""}`}
                >
                  <div
                    className={cn(
                      {
                        "text-center": colIndex > 0,
                      },
                      column.className,
                    )}
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || "")}
                  </div>
                </TableCell>
              ))}

              {/* Actions Cell */}
              {hasActions && (
                <TableCell className="text-center">
                  <ActionButtons
                    item={item}
                    actions={actions}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
