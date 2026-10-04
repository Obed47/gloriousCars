/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  createMatcher,
  normalizeSearch,
  toAdminRow,
  tokenizeSearch,
} from "@/lib/admin/vehicleSearch";
import { makeVehicle, sampleCatalogue } from "../fixtures/vehicles";

describe("normalizeSearch", () => {
  it("lowercases, strips accents and collapses punctuation", () => {
    expect(normalizeSearch("Yaoundé — Bastos")).toBe("yaounde bastos");
    expect(normalizeSearch("Mercedes-Benz")).toBe("mercedes benz");
  });
});

describe("tokenizeSearch", () => {
  it("splits on spaces", () => {
    expect(tokenizeSearch("bmw 2024 suv")).toEqual(["bmw", "2024", "suv"]);
  });

  it("keeps thousands-separated prices together", () => {
    expect(tokenizeSearch("68,500,000")).toEqual(["68500000"]);
  });

  it("returns nothing for a blank query", () => {
    expect(tokenizeSearch("   ")).toEqual([]);
  });
});

describe("toAdminRow", () => {
  it("links a sold vehicle to no public page", () => {
    const sold = makeVehicle({ status: "Sold" });
    expect(toAdminRow(sold).publicPath).toBeNull();
  });

  it("links an available vehicle to its public page", () => {
    expect(toAdminRow(makeVehicle()).publicPath).toBe("/cars/bmw/x5-xdrive40i-2024-pc-bmw-x5-0241");
  });

  it("keeps exact numbers for price, mileage and horsepower", () => {
    expect(toAdminRow(makeVehicle()).numbers).toEqual(["68500000", "12000", "335"]);
  });
});

describe("createMatcher", () => {
  const rows = sampleCatalogue().map(toAdminRow);
  const find = (query: string) => rows.filter(createMatcher(query)).map((r) => r.title);

  it("matches everything for a blank query", () => {
    expect(rows.filter(createMatcher("  "))).toHaveLength(rows.length);
  });

  it("requires every typed word, in any order", () => {
    expect(find("bmw 2024 suv")).toEqual(["2024 BMW X5 xDrive40i"]);
    expect(find("suv bmw")).toEqual(["2024 BMW X5 xDrive40i"]);
    expect(find("bmw 2019")).toEqual([]);
  });

  it("ignores case, accents and punctuation", () => {
    expect(find("YAOUNDE")).toContain("2024 BMW X5 xDrive40i");
    expect(find("mercedes benz")).toEqual([]);
    expect(find("tesla model-3")).toEqual(["2025 Tesla Model 3 Long Range"]);
  });

  it("matches a word anywhere inside a text field", () => {
    expect(find("40i")).toEqual(["2024 BMW X5 xDrive40i"]);
  });

  it("matches a year without matching a price that contains the same digits", () => {
    // The 2024 BMW costs XAF 68,500,000; "2024" must not match a price such as 12,024,000.
    const priced = [makeVehicle({ id: "p", price: 12_024_000, year: 2019 })].map(toAdminRow);
    expect(priced.filter(createMatcher("2024"))).toHaveLength(0);
  });

  it("matches a price typed with thousands separators", () => {
    expect(find("68,500,000")).toEqual(["2024 BMW X5 xDrive40i"]);
  });

  it("matches the stock reference and the featured flag", () => {
    expect(find("pc-tes-m3")).toEqual(["2025 Tesla Model 3 Long Range"]);
    expect(find("featured")).toEqual(["2024 BMW X5 xDrive40i", "2025 Tesla Model 3 Long Range"]);
  });
});
