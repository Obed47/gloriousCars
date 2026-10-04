import type {
  BodyType,
  Condition,
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

export function filterVehicles(
  vehicles: Vehicle[],
  q: VehicleQuery,
): Vehicle[] {
  const search = q.search?.trim().toLowerCase();

  return vehicles.filter((v) => {
    if (!inList(v.brand, q.brand)) return false;
    if (!inList(v.bodyType, q.bodyType)) return false;
    if (!inList(v.fuelType, q.fuelType)) return false;
    if (!inList(v.transmission, q.transmission)) return false;
    if (!inList(v.color, q.color)) return false;
    if (!inList(v.condition, q.condition)) return false;

    if (q.minPrice != null && v.price < q.minPrice) return false;
    if (q.maxPrice != null && v.price > q.maxPrice) return false;
    if (q.minYear != null && v.year < q.minYear) return false;
    if (q.maxYear != null && v.year > q.maxYear) return false;
    if (q.maxMileage != null && v.mileage > q.maxMileage) return false;

    if (search) {
      const haystack = `${vehicleFullTitle(v)} ${v.bodyType} ${v.fuelType} ${v.color} ${v.reference}`.toLowerCase();
      if (!haystack.includes(search)) return false;
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
    bodyTypes: uniqueSorted(vehicles.map((v) => v.bodyType)) as BodyType[],
    fuelTypes: uniqueSorted(vehicles.map((v) => v.fuelType)) as FuelType[],
    transmissions: uniqueSorted(vehicles.map((v) => v.transmission)) as Transmission[],
    colors: uniqueSorted(vehicles.map((v) => v.color)),
    conditions: uniqueSorted(vehicles.map((v) => v.condition)) as Condition[],
    years: uniqueSorted(vehicles.map((v) => v.year)),
    // An empty catalogue would otherwise yield [Infinity, -Infinity].
    priceRange: prices.length ? [Math.min(...prices), Math.max(...prices)] : [0, 0],
    mileageRange: mileages.length
      ? [Math.min(...mileages), Math.max(...mileages)]
      : [0, 0],
  };
}
