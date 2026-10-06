import type { Currency } from "./types";

/** "XAF 68,500" - no decimals, dealership-style. Falls back gracefully. */
export function formatPrice(amount: number, currency: Currency): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "code",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
}

/** Compact price for tight spaces: "XAF 68.5K", "XAF 1.2M". */
export function formatPriceCompact(amount: number, currency: Currency): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "code",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return formatPrice(amount, currency);
  }
}

export const formatMileage = (km: number): string =>
  `${km.toLocaleString("en-US")} km`;

export const formatNumber = (n: number): string => n.toLocaleString("en-US");

/** "2 days ago", "Today" — for freshly listed vehicles. */
export function relativeListedDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Listed today";
  if (days === 1) return "Listed yesterday";
  if (days < 30) return `Listed ${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "Listed 1 month ago" : `Listed ${months} months ago`;
}

/** "2026-10-04" for the local calendar day of `date` (not the UTC day). */
export function localDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
