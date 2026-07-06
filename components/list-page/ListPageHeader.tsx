import {
  IconSearch,
  IconRefresh,
  IconX,
  IconCheck,
  IconChevronDown,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionConfig, FilterConfig, BulkAction } from "./types";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ListPageHeaderProps {
  title: string;
  description?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => Promise<void> | void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageActions?: ActionConfig<any>["pageActions"];
  bulkActions?: BulkAction[];
  selectedCount?: number;
  selectedIds?: string[];
  onClearSelection?: () => void;
  isRefreshing?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: FilterConfig<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activeFilters?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange?: (key: string, value: any) => void;
  onClearFilters?: () => void;
}

export function ListPageHeader({
  title,
  description,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  onRefresh,
  pageActions,
  bulkActions = [],
  selectedCount = 0,
  selectedIds = [],
  onClearSelection,
  isRefreshing = false,
  filters,
  activeFilters = {},
  onFilterChange,
  onClearFilters,
}: ListPageHeaderProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: BulkAction | null;
  }>({ open: false, action: null });

  const hasActiveFilters = Object.values(activeFilters).some(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0),
  );

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: string, value: any) => {
    if (onFilterChange) {
      onFilterChange(key, value);
    }
  };

  const handleBulkAction = async (action: BulkAction) => {
    if (action.confirmMessage) {
      setConfirmDialog({ open: true, action });
    } else {
      await action.onClick(selectedIds.map((id) => String(id)));
      onClearSelection?.();
    }
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.action) {
      await confirmDialog.action.onClick(selectedIds.map((id) => String(id)));
      onClearSelection?.();
      setConfirmDialog({ open: false, action: null });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderFilterControl = (filter: FilterConfig<any>) => {
    if (filter.type === "select") {
      return (
        <Select
          key={filter.key.toString()}
          value={activeFilters[filter.key.toString()]?.toString() || ""}
          onValueChange={(value) =>
            handleFilterChange(filter.key.toString(), value)
          }
        >
          <SelectTrigger className="w-45 border border-primary">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options?.map((option) => (
              <SelectItem
                key={option.value.toString()}
                value={option.value.toString()}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (filter.type === "multiselect") {
      const selectedValues = activeFilters[filter.key.toString()] || [];

      return (
        <Popover key={filter.key.toString()}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              size={"lg"}
              className={cn(
                "w-45 justify-between border border-primary",
                selectedValues.length > 0 && "border-primary",
              )}
            >
              <span className="truncate">
                {selectedValues.length > 0
                  ? `${selectedValues.length} selected`
                  : filter.label}
              </span>
              <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-50 p-0" align="start">
            <div className="max-h-75 overflow-y-auto p-2">
              {filter.options?.map((option) => {
                const isChecked = selectedValues.includes(option.value);

                return (
                  <div
                    key={option.value.toString()}
                    className={cn(
                      "flex items-center space-x-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-primary hover:text-background",
                      isChecked && "",
                    )}
                    onClick={() => {
                      if (isChecked) {
                        handleFilterChange(
                          filter.key.toString(),
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          selectedValues.filter((v: any) => v !== option.value),
                        );
                      } else {
                        handleFilterChange(filter.key.toString(), [
                          ...selectedValues,
                          option.value,
                        ]);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary hover:border-background",
                        isChecked
                          ? "bg-accent text-primary-foreground border-none"
                          : "opacity-50 ",
                      )}
                    >
                      {isChecked && <IconCheck className="h-3 w-3" />}
                    </div>
                    <span className="text-sm flex-1">{option.label}</span>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      );
    }

    return null;
  };

  const buttons = [];
  if (onRefresh) {
    buttons.push(
      <Button
        key="refresh"
        variant="refresh"
        size="lg"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="w-full md:w-auto shrink-0"
      >
        <IconRefresh
          className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
        />
        Refresh
      </Button>,
    );
  }

  if (pageActions) {
    pageActions.forEach((action, index) => {
      buttons.push(
        <Button
          key={`action-${index}`}
          variant={action.variant || "default"}
          size="lg"
          onClick={action.onClick}
          className={cn("w-full md:w-auto", action.className)}
        >
          {action.icon && <action.icon className="h-4 w-4 mr-2" />}
          {action.label}
        </Button>,
      );
    });
  }

  return (
    <div className="space-y-4">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm lg:text-base mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Page Actions */}
        {buttons.length > 0 && (
          <div
            className={cn(
              "grid gap-2 w-full",
              buttons.length === 1 ? "grid-cols-1" : "grid-cols-2",
              "md:flex md:w-auto md:items-center",
            )}
          >
            {buttons}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && bulkActions.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-semibold">
              {selectedCount} selected
            </Badge>
            <Button
              variant="ghost"
              size="lg"
              onClick={onClearSelection}
              className="h-auto p-1"
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-1">
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="lg"
                onClick={() => handleBulkAction(action)}
                disabled={action.requireSelection && selectedCount === 0}
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        {filters && filters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Render all filters as direct dropdowns */}
            {filters.map((filter) => renderFilterControl(filter))}

            {/* Clear filters button */}
            {hasActiveFilters && onClearFilters && (
              <Button
                variant="ghost"
                size="lg"
                onClick={onClearFilters}
                className="gap-2 h-9"
              >
                <IconX className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ open, action: confirmDialog.action })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action?.confirmMessage ||
                `This action will affect ${selectedCount} item(s). This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
