export const CURRENCY_SYMBOL = "৳";

export function formatPrice(amount: number | undefined | null): string {
  if (amount == null) return "—";
  return `${CURRENCY_SYMBOL}${amount.toLocaleString()}`;
}
