/**
 * Budget input validation & sanitization.
 *
 * Allowed characters: digits (0-9), spaces, hyphen (-).
 * Multiple consecutive spaces are collapsed into a single space.
 */

const BUDGET_PATTERN = /^[\d\s-]*$/;

/**
 * Check whether `value` contains only digits, spaces, and hyphens.
 */
export function isValidBudgetInput(value: string): boolean {
  return BUDGET_PATTERN.test(value);
}

/**
 * Normalize a budget string:
 * - Removes any character that is not a digit, space, or hyphen.
 * - Collapses multiple consecutive spaces into a single space.
 */
export function sanitizeBudgetInput(value: string): string {
  return value.replace(/[^\d\s-]/g, "").replace(/\s{2,}/g, " ");
}

// ---------------------------------------------------------------------------
// Filename display helpers
// ---------------------------------------------------------------------------

const UNDERSCORE_PATTERN = /_/g;

/**
 * Replace all underscores with spaces in a string.
 */
export function replaceUnderscoreWithSpace(value: string): string {
  return value.replace(UNDERSCORE_PATTERN, " ");
}

/**
 * Extract a human-readable filename from a URL:
 * - Takes the last path segment (strips query strings).
 * - Replaces underscores with spaces.
 * - Trims extra whitespace.
 *
 * Falls back to "Attachment N" when the URL has no discernible filename.
 */
export function getDisplayFilename(url: string, fallbackIndex: number): string {
  const raw = url.split("/").pop()?.split("?")[0]?.trim();
  if (!raw) return `Attachment ${fallbackIndex}`;
  return replaceUnderscoreWithSpace(raw);
}
