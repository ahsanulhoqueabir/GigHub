import { site } from "../config/site.config";
import {
  CURRENCY_MAP,
  CurrencyCode,
  CurrencyEntry,
  formatAmount,
  getCurrencySymbol,
  toCurrencyCode,
} from "../lib/business/currency";

export interface UseCurrencyReturn {
  /** Resolved currency code – e.g. "BDT" */
  code: CurrencyCode;
  /** Symbol string – e.g. "৳" */
  symbol: string;
  /** Full currency entry from the registry */
  currency: CurrencyEntry;
  /**
   * Format an amount using the active currency.
   * @example format(1500) → "৳1500.00"
   */
  format: (amount: number, decimals?: number) => string;
}

/**
 * Returns the active currency derived from GlobalSettings store.
 *
 * @example
 * const { format, symbol, code } = useCurrency();
 * format(1200)   // "৳1200.00"
 * symbol         // "৳"
 * code           // "BDT"
 */
export function useCurrency(): UseCurrencyReturn {
  const raw = site.currency;
  const code = toCurrencyCode(raw);
  const currency = CURRENCY_MAP[code];

  return {
    code,
    symbol: getCurrencySymbol(code),
    currency,
    format: (amount: number, decimals = 2) =>
      formatAmount(amount, code, decimals),
  };
}
