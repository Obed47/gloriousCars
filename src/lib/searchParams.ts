import type { SortKey, VehicleQuery } from "./types";

/**
 * Canonical URL <-> query mapping for the inventory page.
 * Shared by the server page (reading `searchParams`) and the client
 * <InventoryBrowser> (syncing filter state back to the URL).
 */

export type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const list = (v: string | string[] | undefined): string[] | undefined => {
  const s = first(v);
  if (!s) return undefined;
  const parts = s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
};

const num = (v: string | string[] | undefined): number | undefined => {
  const s = first(v)?.trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

const SORT_KEYS: SortKey[] = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "mileage-asc",
];

export function parseSearchParams(sp: RawParams): VehicleQuery {
  const sortRaw = first(sp.sort) as SortKey | undefined;
  return {
    brand: list(sp.brand),
    fuelType: list(sp.fuel),
    transmission: list(sp.transmission),
    color: list(sp.color),
    minPrice: num(sp.priceMin),
    maxPrice: num(sp.priceMax),
    minYear: num(sp.yearMin),
    maxYear: num(sp.yearMax),
    maxMileage: num(sp.mileageMax),
    search: first(sp.search)?.trim() || undefined,
    sort: sortRaw && SORT_KEYS.includes(sortRaw) ? sortRaw : undefined,
  };
}

export function queryToSearchParams(q: VehicleQuery): URLSearchParams {
  const p = new URLSearchParams();
  const setList = (key: string, v?: string[]) => {
    if (v && v.length) p.set(key, v.join(","));
  };
  const setNum = (key: string, v?: number) => {
    if (v != null && Number.isFinite(v)) p.set(key, String(v));
  };

  setList("brand", q.brand);
  setList("fuel", q.fuelType);
  setList("transmission", q.transmission);
  setList("color", q.color);
  setNum("priceMin", q.minPrice);
  setNum("priceMax", q.maxPrice);
  setNum("yearMin", q.minYear);
  setNum("yearMax", q.maxYear);
  setNum("mileageMax", q.maxMileage);
  if (q.search) p.set("search", q.search);
  if (q.sort && q.sort !== "featured") p.set("sort", q.sort);
  return p;
}

export function queryToSearchString(q: VehicleQuery): string {
  return queryToSearchParams(q).toString();
}

export function hasActiveFilters(q: VehicleQuery): boolean {
  return Boolean(
    q.brand?.length ||
      q.fuelType?.length ||
      q.transmission?.length ||
      q.color?.length ||
      q.minPrice != null ||
      q.maxPrice != null ||
      q.minYear != null ||
      q.maxYear != null ||
      q.maxMileage != null ||
      q.search,
  );
}
