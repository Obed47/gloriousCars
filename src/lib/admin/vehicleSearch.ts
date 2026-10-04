import type { Currency, Vehicle, VehicleStatus } from "@/lib/types";
import { vehicleFullTitle, vehiclePath } from "@/lib/slug";

/**
 * Search for the admin vehicle list.
 *
 * The server turns each vehicle into a slim `AdminVehicleRow` (so the full
 * descriptions, feature lists and photo arrays are not shipped to the browser
 * for every car) that already carries its normalised search text. The browser
 * only tokenises what was typed and checks it against that text, which makes
 * filtering instant.
 *
 * Matching rules:
 *  - Every word typed must match ("bmw 2024 suv" needs all three), in any order.
 *  - Case, accents and punctuation are ignored ("yaounde" finds "Yaoundé",
 *    "mercedes-benz" finds "Mercedes Benz").
 *  - A word matches anywhere inside a text field ("40i" finds "xDrive40i").
 *  - Price, mileage and horsepower match only as whole numbers, so "2024"
 *    finds model-year 2024 but not a car priced XAF 12,024,000.
 */

export interface AdminVehicleRow {
  id: string;
  title: string;
  reference: string;
  location: string;
  price: number;
  currency: Currency;
  status: VehicleStatus;
  featured: boolean;
  /** Public page, or `null` when the vehicle is hidden from the public site (Sold). */
  publicPath: string | null;
  /** Normalised text searched by substring. */
  searchText: string;
  /** Numbers searched by exact match: price, mileage, horsepower. */
  numbers: string[];
}

export function normalizeSearch(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Splits what was typed into words; "68,500" is kept together as 68500. */
export function tokenizeSearch(query: string): string[] {
  const withoutThousandsCommas = query.replace(/(?<=\d),(?=\d{3}\b)/g, "");
  return normalizeSearch(withoutThousandsCommas).split(" ").filter(Boolean);
}

export function toAdminRow(v: Vehicle): AdminVehicleRow {
  const searchText = normalizeSearch(
    [
      vehicleFullTitle(v),
      v.reference,
      v.brand,
      v.model,
      v.trim ?? "",
      v.color,
      v.location,
      v.engine,
      v.bodyType,
      v.fuelType,
      v.transmission,
      v.driveType,
      v.condition,
      v.status,
      v.featured ? "featured" : "",
    ].join(" "),
  );

  return {
    id: v.id,
    title: vehicleFullTitle(v),
    reference: v.reference,
    location: v.location,
    price: v.price,
    currency: v.currency,
    status: v.status,
    featured: v.featured,
    publicPath: v.status === "Sold" ? null : vehiclePath(v),
    searchText,
    numbers: [String(v.price), String(v.mileage), String(v.horsepower)],
  };
}

/** Builds the predicate for one query, so the query is tokenised once, not per row. */
export function createMatcher(query: string): (row: AdminVehicleRow) => boolean {
  const tokens = tokenizeSearch(query);
  if (tokens.length === 0) return () => true;
  return (row) =>
    tokens.every((t) => row.searchText.includes(t) || row.numbers.includes(t));
}
