// ============= Currency Registry =============
// Central source of truth for all supported currencies.
// Add new currencies here – no other file needs to change.

export const CURRENCY_MAP = {
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
  BDT: { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", locale: "bn-BD" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "hi-IN" },
  SAR: { code: "SAR", symbol: "﷼", name: "Saudi Riyal", locale: "ar-SA" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", locale: "ar-AE" },
} as const;

/** Union of all supported currency codes e.g. "EUR" | "BDT" | "USD" */
export type CurrencyCode = keyof typeof CURRENCY_MAP;

/** Shape of a single currency entry */
export type CurrencyEntry = (typeof CURRENCY_MAP)[CurrencyCode];

/** Fallback when the stored code is unknown or missing */
export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

// ============= Pure Helpers (no React) =============

/**
 * Resolve a CurrencyCode from any string.
 * Falls back to DEFAULT_CURRENCY if unrecognised.
 */
export function toCurrencyCode(raw: string | null | undefined): CurrencyCode {
  if (raw && raw in CURRENCY_MAP) return raw as CurrencyCode;
  return DEFAULT_CURRENCY;
}

/**
 * Get the currency entry object for a code.
 * @example getCurrencyEntry("BDT") → { code: "BDT", symbol: "৳", ... }
 */
export function getCurrencyEntry(code: CurrencyCode): CurrencyEntry {
  return CURRENCY_MAP[code];
}

/**
 * Get just the symbol for a currency code.
 * Safe to call with arbitrary strings – falls back to DEFAULT_CURRENCY.
 * @example getCurrencySymbol("BDT") → "৳"
 */
export function getCurrencySymbol(raw: string | null | undefined): string {
  return CURRENCY_MAP[toCurrencyCode(raw)].symbol;
}

/**
 * Format an amount with the symbol for a given currency code.
 * @example formatAmount(1500, "BDT") → "৳1500.00"
 * @example formatAmount(9.5, "EUR", 2) → "€9.50"
 */
export function formatAmount(
  amount: number | null | undefined,
  raw: string | null | undefined,
  decimals: number = 2,
): string {
  const { symbol } = CURRENCY_MAP[toCurrencyCode(raw)];
  const safeAmount = Number.isFinite(amount) ? Number(amount) : 0;
  return `${symbol}${safeAmount.toFixed(decimals)}`;
}

/**
 * Returns an array of currency options suitable for <Select> or similar UI.
 * @example
 * getCurrencyOptions()
 * // [{ value: "EUR", label: "Euro (€)" }, { value: "BDT", label: "Bangladeshi Taka (৳)" }, ...]
 */
export function getCurrencyOptions(): { value: CurrencyCode; label: string }[] {
  return Object.values(CURRENCY_MAP).map(({ code, name, symbol }) => ({
    value: code,
    label: `${name} (${symbol})`,
  }));
}
