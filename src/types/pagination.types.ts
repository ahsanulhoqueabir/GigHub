/**
 * Default page size for paginated list endpoints.
 */
export const DEFAULT_PAGE_LIMIT = 20;

/**
 * Maximum allowed page size (safety cap).
 */
export const MAX_PAGE_LIMIT = 50;

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Standard pagination metadata returned by all list endpoints.
 */
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Wraps list data + pagination meta for consistent API responses.
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Cache key for tracking fetched pages in stores.
 */
export interface PageCacheKey {
  /** Unique identifier for the filter combination (JSON-stringified filters) */
  filterHash: string;
  /** Page number */
  page: number;
  /** Page size */
  pageSize: number;
}

/**
 * Cached page entry stored in the store.
 */
export interface CachedPage<T> {
  items: T[];
  pagination: PaginationMeta;
  fetchedAt: number;
}

/**
 * Pagination input options accepted by service list methods.
 * Mirrors the relevant subset of SearchQueryOptions.
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Result of parsing pagination options.
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface SearchQueryOptions {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  force?: boolean;
  filters?: Record<string, string | boolean | number>;
}
