import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  PaginationMeta,
  PaginationOptions,
  PaginationParams,
} from "@/types/pagination.types";

/**
 * Default pagination state factory.
 * Pass a custom `limit` to override the default (20).
 *
 * @example
 * ```ts
 * pagination: defaultPagination(),       // limit = 20
 * pagination: defaultPagination(10),     // limit = 10
 * ```
 */
export function defaultPagination(limit = DEFAULT_PAGE_LIMIT): PaginationMeta {
  return {
    hasNext: false,
    hasPrev: false,
    currentPage: 1,
    pageSize: limit,
    totalPages: 0,
    total: 0,
  };
}

/**
 * Parse and clamp pagination options into a consistent { page, limit, offset } shape.
 *
 * - `page` defaults to 1, minimum 1
 * - `limit` defaults to `DEFAULT_PAGE_LIMIT` (20), clamped between 1 and `MAX_PAGE_LIMIT` (50)
 * - `offset` = (page - 1) * limit
 *
 * @example
 * ```ts
 * const { page, limit, offset } = paginationParams(options);
 * ```
 */
export function paginationParams(
  options?: PaginationOptions,
): PaginationParams {
  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.min(
    MAX_PAGE_LIMIT,
    Math.max(1, options?.limit ?? DEFAULT_PAGE_LIMIT),
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Build a PaginationMeta object from pagination params and a raw filter_count value.
 *
 * @example
 * ```ts
 * const { page, limit, offset } = paginationParams(options);
 * // ... make API call, extract filterCount from response meta ...
 * const pagination = paginationMeta({ page, limit, filterCount });
 * ```
 */
export function paginationMeta(params: {
  page: number;
  limit: number;
  totalItems: number;
}): PaginationMeta {
  const { page, limit, totalItems } = params;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;

  return {
    hasNext: totalPages > 0 && page < totalPages,
    hasPrev: page > 1,
    currentPage: page,
    pageSize: limit,
    totalPages,
    total: totalItems,
  };
}
