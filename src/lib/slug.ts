import type { Vehicle } from "./types";

/** URL-safe slug: lowercase, ascii-ish, hyphen-separated. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const brandSlug = (v: Pick<Vehicle, "brand">): string => slugify(v.brand);

export const vehicleSlug = (
  v: Pick<Vehicle, "model" | "trim" | "year">,
): string => slugify(`${v.model} ${v.trim ?? ""} ${v.year}`);

/** Clean, human-readable detail URL: /cars/bmw/x5-xdrive40i-2024 */
export const vehiclePath = (
  v: Pick<Vehicle, "brand" | "model" | "trim" | "year">,
): string => `/cars/${brandSlug(v)}/${vehicleSlug(v)}`;

export const vehicleTitle = (
  v: Pick<Vehicle, "brand" | "model" | "trim">,
): string => `${v.brand} ${v.model}${v.trim ? ` ${v.trim}` : ""}`;

export const vehicleFullTitle = (
  v: Pick<Vehicle, "brand" | "model" | "trim" | "year">,
): string => `${v.year} ${vehicleTitle(v)}`;
