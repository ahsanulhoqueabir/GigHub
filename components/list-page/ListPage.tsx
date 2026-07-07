import { useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ListPageHeader } from "./ListPageHeader";
import { TablePagination } from "./TablePagination";
import { useListPageState } from "./useListPageState";
import { ListPageProps } from "./types";
import { DataTable } from "./DataTable";
import { FloatingBulkActionBar } from "./FloatingBulkActionBar";
import { TableSkeleton } from "@/components/shared/table-skeleton";

type SortableValue = string | number | boolean | Date | null | undefined;

const normalizeSortValue = (value: SortableValue) => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  return value;
};

export function ListPage<T extends { id: string }>({
  data,
  loading,
  error,
  config,
  className,
  customDataProcessor,
  onSelectionChange,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ListPageProps<T>) {
  const {
    state,
    setFilter,
    clearFilters,
    setSearchQuery,
    setPage,
    setPageSize,
    toggleSelection,
    selectAll,
    setSorting,
    setRefreshing,
  } = useListPageState(pageSize);

  // Process data (filtering, sorting, searching)
  const processedData = useMemo(() => {
    let filtered = Array.isArray(data) ? [...data] : [];

    // Apply custom data processor first if provided
    if (customDataProcessor) {
      filtered = customDataProcessor(filtered, state.activeFilters);
    } else {
      // Apply standard filters
      Object.entries(state.activeFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value) && value.length > 0) {
            // Multi-select filter
            filtered = filtered.filter((item) =>
              value.includes(String(item[key as keyof T])),
            );
          } else {
            // Single select filter
            filtered = filtered.filter(
              (item) => String(item[key as keyof T]) === String(value),
            );
          }
        }
      });
    }

    // Apply search
    if (state.searchQuery && config.search?.fields) {
      const searchLower = state.searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        config.search!.fields.some((field) => {
          const fieldValue = item[field];
          return (
            fieldValue && String(fieldValue).toLowerCase().includes(searchLower)
          );
        }),
      );
    }

    // Apply sorting
    if (state.sortBy) {
      const sortColumn = config.columns.find(
        (column) => String(column.key) === state.sortBy,
      );

      filtered.sort((a, b) => {
        const aVal = normalizeSortValue(
          sortColumn?.sortValue
            ? sortColumn.sortValue(a)
            : (a[state.sortBy as keyof T] as SortableValue),
        );
        const bVal = normalizeSortValue(
          sortColumn?.sortValue
            ? sortColumn.sortValue(b)
            : (b[state.sortBy as keyof T] as SortableValue),
        );

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        // Compare values
        let result = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          result = aVal.localeCompare(bVal);
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          result = aVal - bVal;
        } else {
          result = String(aVal).localeCompare(String(bVal));
        }

        return state.sortDirection === "desc" ? -result : result;
      });
    }

    return filtered;
  }, [
    data,
    customDataProcessor,
    state.searchQuery,
    state.sortBy,
    state.activeFilters,
    state.sortDirection,
    config.search,
    config.columns,
  ]);

  // When pagination props are provided, data is already the current page from the store.
  // Otherwise fall back to client-side pagination for backward compatibility.
  const isStorePaginated =
    totalItems !== undefined &&
    currentPage !== undefined &&
    pageSize !== undefined;

  const paginatedData = useMemo(() => {
    if (isStorePaginated) {
      return Array.isArray(data) ? data : [];
    }
    const startIndex = (state.currentPage - 1) * state.pageSize;
    return processedData.slice(startIndex, startIndex + state.pageSize);
  }, [
    data,
    isStorePaginated,
    processedData,
    state.currentPage,
    state.pageSize,
  ]);

  const displayTotalItems = isStorePaginated
    ? totalItems
    : processedData.length;
  const displayPage = isStorePaginated ? currentPage : state.currentPage;
  const displayPageSize = isStorePaginated ? pageSize : state.pageSize;

  const handlePageChange = useCallback(
    (page: number) => {
      if (isStorePaginated && onPageChange) {
        onPageChange(page);
      } else {
        setPage(page);
      }
    },
    [isStorePaginated, onPageChange, setPage],
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      if (isStorePaginated && onPageSizeChange) {
        onPageSizeChange(size);
      } else {
        setPageSize(size);
      }
    },
    [isStorePaginated, onPageSizeChange, setPageSize],
  );

  // Handle refresh
  const handleRefresh = async () => {
    if (config.onRefresh) {
      setRefreshing(true);
      try {
        await config.onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (config.onDelete) {
      await config.onDelete(id);
      // Clear selection if deleted item was selected
      if (state.selectedItems.includes(id)) {
        const newSelection = state.selectedItems.filter((item) => item !== id);
        selectAll(newSelection);
      }
    }
  };

  // Generate search placeholder
  const searchPlaceholder =
    config.search?.placeholder ||
    `Search ${config.search?.fields.join(", ") || "items"}...`;

  // Get bulk action config
  const bulkConfig = config.actions?.bulk;
  const showBulkActions =
    bulkConfig?.enabled !== false &&
    bulkConfig?.actions &&
    bulkConfig.actions.length > 0;
  const bulkPosition = bulkConfig?.position || "bottom";

  // Use page actions directly (no permission filtering)
  const filteredPageActions = config.actions?.pageActions;

  // Use bulk actions directly (no permission filtering)
  const filteredBulkActions = bulkConfig?.actions;

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      {/* Header */}
      <ListPageHeader
        title={config.title}
        description={config.description}
        searchQuery={state.searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={searchPlaceholder}
        onRefresh={config.onRefresh ? handleRefresh : undefined}
        pageActions={filteredPageActions}
        bulkActions={
          bulkPosition === "inline" ? filteredBulkActions : undefined
        }
        {...(bulkConfig?.enableSelection
          ? {
              selectedCount: state.selectedItems.length,
              selectedIds: state.selectedItems,
              onClearSelection: () => selectAll([]),
            }
          : {})}
        isRefreshing={state.isRefreshing}
        filters={config.filters}
        activeFilters={state.activeFilters}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
      />

      {/* Scrollable Data Table / Cards area with integrated pagination */}
      <div className="flex-1 min-h-0 mt-4 overflow-y-auto">
        {config.renderCard ? (
          <>
            <div className="hidden md:block">
              <DataTable
                data={paginatedData}
                columns={config.columns}
                loading={loading}
                error={error}
                {...(bulkConfig?.enableSelection
                  ? {
                      selectedItems: state.selectedItems,
                      onToggleSelection: (id) => {
                        toggleSelection(id);
                        if (onSelectionChange) {
                          const newSelection = state.selectedItems.includes(
                            String(id),
                          )
                            ? state.selectedItems.filter(
                                (item) => item !== String(id),
                              )
                            : [...state.selectedItems, String(id)];
                          onSelectionChange(newSelection);
                        }
                      },
                      onSelectAll: (ids) => {
                        selectAll(ids);
                        if (onSelectionChange) {
                          onSelectionChange(ids);
                        }
                      },
                    }
                  : {})}
                onSort={setSorting}
                sortBy={state.sortBy}
                sortDirection={state.sortDirection}
                actions={config.actions}
                onEdit={config.onEdit}
                onDelete={handleDelete}
                emptyMessage={`No ${config.title.toLowerCase()} found`}
              />
            </div>
            <div className="block md:hidden space-y-4">
              {loading ? (
                <TableSkeleton variant="card" rows={3} />
              ) : error ? (
                <div className="rounded-md border p-8 text-center bg-card">
                  <div className="text-destructive font-medium">Error</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {error}
                  </div>
                </div>
              ) : paginatedData.length === 0 ? (
                <div className="rounded-md border p-8 text-center bg-card">
                  <div className="text-muted-foreground">{`No ${config.title.toLowerCase()} found`}</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {paginatedData.map((item) => (
                    <div key={String(item.id)}>{config.renderCard!(item)}</div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <DataTable
            data={paginatedData}
            columns={config.columns}
            loading={loading}
            error={error}
            {...(bulkConfig?.enableSelection
              ? {
                  selectedItems: state.selectedItems,
                  onToggleSelection: (id) => {
                    toggleSelection(id);
                    if (onSelectionChange) {
                      const newSelection = state.selectedItems.includes(
                        String(id),
                      )
                        ? state.selectedItems.filter(
                            (item) => item !== String(id),
                          )
                        : [...state.selectedItems, String(id)];
                      onSelectionChange(newSelection);
                    }
                  },
                  onSelectAll: (ids) => {
                    selectAll(ids);
                    if (onSelectionChange) {
                      onSelectionChange(ids);
                    }
                  },
                }
              : {})}
            onSort={setSorting}
            sortBy={state.sortBy}
            sortDirection={state.sortDirection}
            actions={config.actions}
            onEdit={config.onEdit}
            onDelete={handleDelete}
            emptyMessage={`No ${config.title.toLowerCase()} found`}
          />
        )}

        {/* Pagination — inside the scrollable area so it stays with the content */}
        <TablePagination
          currentPage={displayPage}
          pageSize={displayPageSize}
          totalItems={displayTotalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={
            config.pagination?.showPageSizeSelector
              ? handlePageSizeChange
              : undefined
          }
          pageSizeOptions={config.pagination?.pageSizeOptions}
          showPageSizeSelector={config.pagination?.showPageSizeSelector}
          showQuickJumper={config.pagination?.showQuickJumper}
        />
      </div>

      {/* Floating Bulk Action Bar */}
      {showBulkActions && bulkPosition !== "inline" && (
        <FloatingBulkActionBar
          selectedCount={state.selectedItems.length}
          selectedIds={state.selectedItems}
          onClearSelection={() => selectAll([])}
          bulkActions={filteredBulkActions || []}
          position={bulkPosition}
          showClearButton={bulkConfig?.showClearButton}
        />
      )}
    </div>
  );
}
