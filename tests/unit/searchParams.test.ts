/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  hasActiveFilters,
  parseSearchParams,
  queryToSearchParams,
  queryToSearchString,
} from "@/lib/searchParams";

describe("parseSearchParams", () => {
  it("returns an empty query for no parameters", () => {
    const q = parseSearchParams({});
    expect(hasActiveFilters(q)).toBe(false);
    expect(q.sort).toBeUndefined();
  });

  it("splits comma-separated lists and drops blank entries", () => {
    const q = parseSearchParams({ brand: "BMW, Audi,,", body: "SUV" });
    expect(q.brand).toEqual(["BMW", "Audi"]);
    expect(q.bodyType).toEqual(["SUV"]);
  });

  it("reads the first value when a parameter repeats", () => {
    expect(parseSearchParams({ brand: ["BMW", "Audi"] }).brand).toEqual(["BMW"]);
  });

  it("parses numeric bounds and ignores non-numeric ones", () => {
    const q = parseSearchParams({ priceMin: "1000000", priceMax: "abc", yearMin: "2020" });
    expect(q.minPrice).toBe(1_000_000);
    expect(q.maxPrice).toBeUndefined();
    expect(q.minYear).toBe(2020);
  });

  it("treats a whitespace-only number as absent, not as zero", () => {
    // Regression: Number("  ") is 0, so a stray space in the URL used to become
    // a real "up to XAF 0" filter that hides every vehicle.
    expect(parseSearchParams({ priceMax: "   " }).maxPrice).toBeUndefined();
    expect(parseSearchParams({ mileageMax: " " }).maxMileage).toBeUndefined();
  });

  it("ignores an unknown sort key", () => {
    expect(parseSearchParams({ sort: "cheapest" }).sort).toBeUndefined();
    expect(parseSearchParams({ sort: "price-asc" }).sort).toBe("price-asc");
  });

  it("trims the free-text search and drops it when blank", () => {
    expect(parseSearchParams({ search: "  bmw  " }).search).toBe("bmw");
    expect(parseSearchParams({ search: "   " }).search).toBeUndefined();
  });
});

describe("queryToSearchParams", () => {
  it("omits empty filters and the default sort", () => {
    expect(queryToSearchString({ brand: [], sort: "featured" })).toBe("");
  });

  it("writes lists comma-separated under the public parameter names", () => {
    const p = queryToSearchParams({ brand: ["BMW", "Audi"], bodyType: ["SUV"], maxPrice: 40_000_000 });
    expect(p.get("brand")).toBe("BMW,Audi");
    expect(p.get("body")).toBe("SUV");
    expect(p.get("priceMax")).toBe("40000000");
  });

  it("keeps a non-default sort", () => {
    expect(queryToSearchParams({ sort: "price-desc" }).get("sort")).toBe("price-desc");
  });

  it("round-trips through parseSearchParams", () => {
    const original = {
      brand: ["BMW"],
      fuelType: ["Hybrid", "Electric"],
      minYear: 2022,
      maxMileage: 50_000,
      search: "suv",
      sort: "mileage-asc" as const,
    };
    const parsed = parseSearchParams(
      Object.fromEntries(queryToSearchParams(original).entries()),
    );
    expect(parsed).toEqual(expect.objectContaining(original));
  });

  it("survives special characters in the search text", () => {
    const qs = queryToSearchString({ search: "Yaoundé & Douala" });
    const parsed = parseSearchParams(Object.fromEntries(new URLSearchParams(qs).entries()));
    expect(parsed.search).toBe("Yaoundé & Douala");
  });
});

describe("hasActiveFilters", () => {
  it("is false when only the sort is set", () => {
    expect(hasActiveFilters({ sort: "newest" })).toBe(false);
  });

  it("is true for a numeric bound of zero", () => {
    expect(hasActiveFilters({ minPrice: 0 })).toBe(true);
  });
});
