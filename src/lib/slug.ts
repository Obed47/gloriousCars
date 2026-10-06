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

/**
 * The stock reference is part of the slug so that two identical cars in stock
 * (same name and year) still get their own URL. References are unique.
 */
export const vehicleSlug = (
  v: Pick<Vehicle, "name" | "year" | "reference">,
): string => slugify(`${v.name} ${v.year} ${v.reference}`);

/** Clean, human-readable detail URL: /cars/bmw/bmw-x5-xdrive40i-2024-pc-bmw-x5-0241 */
export const vehiclePath = (
  v: Pick<Vehicle, "brand" | "name" | "year" | "reference">,
): string => `/cars/${brandSlug(v)}/${vehicleSlug(v)}`;

export const vehicleTitle = (v: Pick<Vehicle, "name">): string => v.name;

export const vehicleFullTitle = (
  v: Pick<Vehicle, "name" | "year">,
): string => `${v.year} ${v.name}`;
