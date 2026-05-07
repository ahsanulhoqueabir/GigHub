export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Creates a unique slug by appending Date.now() — no DB query needed.
 * The resulting format is: `my-title-1712345678901`
 */
export function generateUniqueSlug(text: string): string {
  const base = generateSlug(text) || 'item';
  return `${base}-${Date.now()}`;
}
