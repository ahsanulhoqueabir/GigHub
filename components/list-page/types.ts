import { ReactNode, type ElementType } from "react";
import { QueryFilter } from "@/types/generic.types";

// Column Configuration
export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  width: number; // Percentage of total width (0-100)
  sortable?: boolean;
  sortValue?: (item: T) => string | number | boolean | Date | null | undefined;
  searchable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, item: T) => ReactNode;
  className?: string;
}

// Filter Configuration
export interface FilterOption {
  value: string | number | boolean;
  label: string;
}

export interface FilterConfig<T> {
  key: keyof T;
  type: "select" | "multiselect" | "text" | "date" | "daterange" | "number";
  label: string;
  options?: FilterOption[];
  placeholder?: string;
  multiple?: boolean;
}

// Search Configuration
export interface SearchConfig<T> {
  fields: (keyof T)[];
  placeholder?: string;
}

// Action Configuration
export interface ActionButton<T> {
  label: string;
  icon?: ElementType;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  onClick: (item: T) => void;
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
  className?: string;
}

export interface BulkAction {
  label: string;
  icon?: ElementType;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  onClick: (selectedIds: string[]) => Promise<void> | void;
  confirmMessage?: string;
  requireSelection?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface BulkActionConfig {
  enabled?: boolean;
  position?: "bottom" | "top" | "inline";
  showClearButton?: boolean;
  actions?: BulkAction[];
}

export interface ActionConfig<T> {
  default?: ("edit" | "delete")[];
  additional?: ActionButton<T>[];
  pageActions?: {
    label: string;
    icon?: ElementType;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";

    onClick: () => void;
    className?: string;
  }[];
  bulk?: BulkActionConfig;
  canEdit?: (item: T) => boolean;
  canDelete?: (item: T) => boolean;
}

// Export Configuration
export interface ExportConfig<T> {
  enabled?: boolean;
  formats?: ("csv" | "excel" | "pdf")[];
  filename?: string;
  fields?: (keyof T)[];
  customExporter?: (data: T[], format: string) => void;
}

// Pagination Configuration
export interface PaginationConfig {
  /** Available page size options in the dropdown */
  pageSizeOptions?: number[];
  /** Whether to show the page size selector */
  showPageSizeSelector?: boolean;
  /** Whether to show the quick page jumper */
  showQuickJumper?: boolean;
}

// Main Configuration Interface
export interface ListPageConfig<T> {
  // Page Configuration
  title: string;
  description?: string;

  // Column Configuration
  columns: ColumnConfig<T>[];

  // Action Configuration
  actions?: ActionConfig<T>;

  // Filter Configuration
  filters?: FilterConfig<T>[];

  // Search Configuration
  search?: SearchConfig<T>;

  // Pagination Configuration
  pagination?: PaginationConfig;

  // Export Configuration
  export?: ExportConfig<T>;

  // Card view on mobile
  renderCard?: (item: T) => ReactNode;

  // Event Handlers
  onRefresh?: () => Promise<void> | void;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => Promise<void> | void;
  onBulkDelete?: (ids: string[]) => Promise<void> | void;
}

// Internal State Interface
export interface ListPageState {
  // Filter states
  activeFilters: QueryFilter;
  searchQuery: string;

  // Pagination states
  currentPage: number;
  pageSize: number;

  // Selection states
  selectedItems: string[];

  // UI states
  sortBy: string | null;
  sortDirection: "asc" | "desc";

  // Loading states
  isRefreshing: boolean;
}

// Props Interface
export interface ListPageProps<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  config: ListPageConfig<T>;
  className?: string;
  customDataProcessor?: (data: T[], filters: QueryFilter) => T[];
  onSelectionChange?: (selectedIds: string[]) => void;

  // ── Pagination (store-controlled) ──────────────────────────────────────
  /** Total number of items matching current filters (from server) */
  totalItems?: number;
  /** Current page number */
  currentPage?: number;
  /** Items per page */
  pageSize?: number;
  /** Called when user navigates to a page */
  onPageChange?: (page: number) => void;
  /** Called when user changes page size */
  onPageSizeChange?: (size: number) => void;
}
