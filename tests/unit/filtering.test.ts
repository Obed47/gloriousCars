/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  deriveFilterOptions,
  filterVehicles,
  sortVehicles,
} from "@/lib/filtering";
import { makeVehicle, sampleCatalogue } from "../fixtures/vehicles";

const titles = (list: { brand: string; model: string }[]) =>
  list.map((v) => `${v.brand} ${v.model}`);

describe("filterVehicles", () => {
  const catalogue = sampleCatalogue();

  it("returns everything when no filter is set", () => {
    expect(filterVehicles(catalogue, {})).toHaveLength(catalogue.length);
  });

  it("matches any of the selected brands", () => {
    const result = filterVehicles(catalogue, { brand: ["BMW", "Audi"] });
    expect(titles(result).sort()).toEqual(["Audi A4", "BMW X5"]);
  });

  it("treats an empty selection as no filter", () => {
    expect(filterVehicles(catalogue, { brand: [] })).toHaveLength(catalogue.length);
  });

  it("applies inclusive price bounds", () => {
    const result = filterVehicles(catalogue, { minPrice: 15_500_000, maxPrice: 21_900_000 });
    expect(titles(result).sort()).toEqual(["Audi A4", "Toyota RAV4"]);
  });

  it("applies year and mileage limits", () => {
    const result = filterVehicles(catalogue, { minYear: 2023, maxMileage: 40_000 });
    expect(titles(result).sort()).toEqual(["BMW X5", "Tesla Model 3", "Toyota RAV4"]);
  });

  it("matches search text against the vehicle title", () => {
    expect(titles(filterVehicles(catalogue, { search: "rav4" }))).toEqual(["Toyota RAV4"]);
    expect(titles(filterVehicles(catalogue, { search: "  2019 volkswagen  " }))).toEqual([
      "Volkswagen Golf",
    ]);
  });

  it("matches search text against body type, fuel and colour", () => {
    expect(titles(filterVehicles(catalogue, { search: "hatchback" }))).toEqual(["Volkswagen Golf"]);
    expect(titles(filterVehicles(catalogue, { search: "electric" }))).toEqual(["Tesla Model 3"]);
    expect(titles(filterVehicles(catalogue, { search: "alpine" }))).toEqual(["BMW X5"]);
  });

  it("matches search text against the stock reference", () => {
    expect(titles(filterVehicles(catalogue, { search: "PC-TES-M3" }))).toEqual(["Tesla Model 3"]);
  });

  it("matches search text against transmission", () => {
    // Regression: the "Automatic" quick link on the navbar search returned nothing
    // because transmission was not part of the searchable text.
    const automatic = filterVehicles(catalogue, { search: "automatic" });
    expect(automatic.length).toBeGreaterThan(0);
    expect(automatic.every((v) => v.transmission === "Automatic")).toBe(true);
  });

  it("matches search text against the drive type", () => {
    expect(titles(filterVehicles(catalogue, { search: "awd" }))).toEqual(["BMW X5"]);
  });

  it("ignores a blank search", () => {
    expect(filterVehicles(catalogue, { search: "   " })).toHaveLength(catalogue.length);
  });

  it("combines filters with AND", () => {
    const result = filterVehicles(catalogue, { bodyType: ["SUV"], fuelType: ["Hybrid"] });
    expect(titles(result)).toEqual(["Toyota RAV4"]);
  });
});

describe("sortVehicles", () => {
  it("puts available cars first, then reserved, then sold, in 'featured' order", () => {
    const sorted = sortVehicles(sampleCatalogue(), "featured");
    const statuses = sorted.map((v) => v.status);
    expect(statuses).toEqual([...statuses].sort((a, b) => rank(a) - rank(b)));
    expect(sorted.at(-1)?.status).toBe("Sold");
  });

  it("lists featured cars before non-featured within the same status", () => {
    const list = [
      makeVehicle({ id: "a", featured: false, listedAt: "2026-09-10T00:00:00Z" }),
      makeVehicle({ id: "b", featured: true, listedAt: "2026-01-01T00:00:00Z" }),
    ];
    expect(sortVehicles(list, "featured").map((v) => v.id)).toEqual(["b", "a"]);
  });

  it("sorts by price in both directions without mutating the input", () => {
    const list = sampleCatalogue();
    const copy = [...list];
    expect(sortVehicles(list, "price-asc")[0].price).toBe(9_800_000);
    expect(sortVehicles(list, "price-desc")[0].price).toBe(68_500_000);
    expect(list).toEqual(copy);
  });

  it("sorts by lowest mileage", () => {
    expect(sortVehicles(sampleCatalogue(), "mileage-asc")[0].mileage).toBe(4_000);
  });

  it("sorts newest first", () => {
    expect(sortVehicles(sampleCatalogue(), "newest")[0].brand).toBe("Tesla");
  });
});

function rank(status: string): number {
  return { Available: 0, Reserved: 1, Sold: 2 }[status] ?? 9;
}

describe("deriveFilterOptions", () => {
  it("lists distinct values in sorted order", () => {
    const options = deriveFilterOptions(sampleCatalogue());
    expect(options.brands).toEqual(["Audi", "BMW", "Tesla", "Toyota", "Volkswagen"]);
    expect(options.years).toEqual([2019, 2020, 2023, 2024, 2025]);
  });

  it("reports the price and mileage ranges", () => {
    const options = deriveFilterOptions(sampleCatalogue());
    expect(options.priceRange).toEqual([9_800_000, 68_500_000]);
    expect(options.mileageRange).toEqual([4_000, 96_000]);
  });

  it("does not return infinities for an empty catalogue", () => {
    const options = deriveFilterOptions([]);
    expect(options.priceRange).toEqual([0, 0]);
    expect(options.mileageRange).toEqual([0, 0]);
    expect(options.brands).toEqual([]);
  });
});
