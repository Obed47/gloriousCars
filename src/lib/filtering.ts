import type {
  FilterOptions,
  FuelType,
  SortKey,
  Transmission,
  Vehicle,
  VehicleQuery,
} from "./types";
import { vehicleFullTitle } from "./slug";

/**
 * Pure, dependency-free filtering + sorting. Safe to run on the server
 * (repository) or the client (instant inventory filtering).
 */

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "mileage-asc", label: "Lowest Mileage" },
];

const inList = (value: string, list?: string[]): boolean =>
  !list || list.length === 0 || list.includes(value);

/** Everything a visitor might type to find a car, lowercased. */
function searchableText(v: Vehicle): string {
  return [
    vehicleFullTitle(v),
    v.fuelType,
    v.transmission,
    v.color,
    v.location,
    v.reference,
  ]
    .join(" ")
    .toLowerCase();
}

export function filterVehicles(
  vehicles: Vehicle[],
  q: VehicleQuery,
): Vehicle[] {
  const search = q.search?.trim().toLowerCase();

  return vehicles.filter((v) => {
    if (!inList(v.brand, q.brand)) return false;
    if (!inList(v.fuelType, q.fuelType)) return false;
    if (!inList(v.transmission, q.transmission)) return false;
    if (!inList(v.color, q.color)) return false;

    if (q.minPrice != null && v.price < q.minPrice) return false;
    if (q.maxPrice != null && v.price > q.maxPrice) return false;
    if (q.minYear != null && v.year < q.minYear) return false;
    if (q.maxYear != null && v.year > q.maxYear) return false;
    if (q.maxMileage != null && v.mileage > q.maxMileage) return false;

    if (search) {
      // Every typed word must appear somewhere (any order), as on the admin list.
      const haystack = searchableText(v);
      if (!search.split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    return true;
  });
}

const STATUS_RANK: Record<Vehicle["status"], number> = {
  Available: 0,
  Reserved: 1,
  Sold: 2,
};

export function sortVehicles(vehicles: Vehicle[], sort: SortKey = "featured"): Vehicle[] {
  const list = [...vehicles];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "mileage-asc":
      return list.sort((a, b) => a.mileage - b.mileage);
    case "newest":
      return list.sort(
        (a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime(),
      );
    case "featured":
    default:
      return list.sort((a, b) => {
        if (a.status !== b.status) return STATUS_RANK[a.status] - STATUS_RANK[b.status];
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
      });
  }
}

/** Price steps for a dropdown: a round step, sized so the list stays short. */
const PRICE_STEPS = [
  10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000,
];

/**
 * Round price values covering `[min, max]`, with about `maxOptions` entries at
 * most. A fixed step gave thousands of options for real XAF prices.
 */
export function priceSteps(min: number, max: number, maxOptions = 40): number[] {
  if (!(max > 0)) return [];
  const span = Math.max(max - Math.max(min, 0), 0);
  const step = PRICE_STEPS.find((s) => span / s <= maxOptions) ?? PRICE_STEPS.at(-1)!;
  const start = Math.floor(Math.max(min, 0) / step) * step;
  const end = Math.ceil(max / step) * step;
  const steps: number[] = [];
  for (let p = start; p <= end; p += step) steps.push(p);
  return steps;
}

const uniqueSorted = <T extends string | number>(values: T[]): T[] =>
  [...new Set(values)].sort((a, b) =>
    typeof a === "number" && typeof b === "number"
      ? a - b
      : String(a).localeCompare(String(b)),
  );

export function deriveFilterOptions(vehicles: Vehicle[]): FilterOptions {
  const prices = vehicles.map((v) => v.price);
  const mileages = vehicles.map((v) => v.mileage);
  return {
    brands: uniqueSorted(vehicles.map((v) => v.brand)),
    fuelTypes: uniqueSorted(vehicles.map((v) => v.fuelType)) as FuelType[],
    transmissions: uniqueSorted(vehicles.map((v) => v.transmission)) as Transmission[],
    colors: uniqueSorted(vehicles.map((v) => v.color)),
    years: uniqueSorted(vehicles.map((v) => v.year)),
    // An empty catalogue would otherwise yield [Infinity, -Infinity].
    priceRange: prices.length ? [Math.min(...prices), Math.max(...prices)] : [0, 0],
    mileageRange: mileages.length
      ? [Math.min(...mileages), Math.max(...mileages)]
      : [0, 0],
  };
}
