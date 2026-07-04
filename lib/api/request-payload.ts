export async function getRouteParam(
  context: { params?: unknown } | undefined,
  name: string,
): Promise<string | undefined> {
  if (!context) {
    return undefined;
  }

  const params = (await context.params) as Record<string, string | undefined>;
  return params[name];
}

/**
 * Shared utilities for parsing common query parameters from API routes.
 *
 * Every list endpoint needs to parse `page`, `limit`, `sortBy`, `sortOrder`
 * from the URL search params. This module centralises that logic so it
 * doesn't have to be repeated across every route handler.
 */

/**
 * Parse `page` and `limit` from URLSearchParams.
 *
 * @param params - The URLSearchParams object from the request
 * @param defaults - Optional overrides for default values
 * @returns `{ page, limit }` — both are guaranteed to be positive integers
 *
 * @example
 * ```ts
 * const { page, limit } = parsePagination(searchParams);
 * // page = 1, limit = 50  (when params are missing or invalid)
 *
 * const { page, limit } = parsePagination(searchParams, { defaultLimit: 100 });
 * // page = 1, limit = 100
 * ```
 */
export function parsePagination(
  params: URLSearchParams,
  defaults?: { defaultPage?: number; defaultLimit?: number; maxLimit?: number },
): { page: number; limit: number } {
  const defaultPage = defaults?.defaultPage ?? 1;
  const defaultLimit = defaults?.defaultLimit ?? 50;
  const maxLimit = defaults?.maxLimit ?? 1000;

  let page = defaultPage;
  let limit = defaultLimit;

  const pageStr = params.get("page");
  if (pageStr) {
    const parsed = parseInt(pageStr, 10);
    if (!isNaN(parsed) && parsed > 0) {
      page = parsed;
    }
  }

  const limitStr = params.get("limit");
  if (limitStr) {
    const parsed = parseInt(limitStr, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= maxLimit) {
      limit = parsed;
    }
  }

  return { page, limit };
}

/**
 * Parse `sortBy` and `sortOrder` from URLSearchParams.
 *
 * @param params - The URLSearchParams object from the request
 * @param allowedFields - Optional whitelist of valid sort field names.
 *                        If provided, `sortBy` is only set when it matches.
 * @returns `{ sortBy, sortOrder }`
 *
 * @example
 * ```ts
 * const { sortBy, sortOrder } = parseSorting(searchParams, ["name", "date_created"]);
 * ```
 */
export function parseSorting(
  params: URLSearchParams,
  allowedFields?: string[],
): { sortBy: string | undefined; sortOrder: "asc" | "desc" | undefined } {
  let sortBy: string | undefined;
  let sortOrder: "asc" | "desc" | undefined;

  const sortByStr = params.get("sortBy");
  if (sortByStr) {
    if (!allowedFields || allowedFields.includes(sortByStr)) {
      sortBy = sortByStr;
    }
  }

  const sortOrderStr = params.get("sortOrder");
  if (sortOrderStr === "asc" || sortOrderStr === "desc") {
    sortOrder = sortOrderStr;
  }

  return { sortBy, sortOrder };
}

export function getQueryParam(
  request: URLSearchParams,
  key: string,
): string | undefined {
  return request.get(key) ?? undefined;
}
