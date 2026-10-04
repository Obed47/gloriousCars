/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { brandSlug, vehicleSlug } from "@/lib/slug";
import { makeVehicle, makeVehicleRow, photo, sampleCatalogue } from "../fixtures/vehicles";

/**
 * The repository reads Supabase through `createSupabasePublicClient`. Replace
 * that client with an in-memory table so each query path can be exercised.
 */
const state: { rows: unknown[]; error: { message: string } | null } = { rows: [], error: null };

vi.mock("@/lib/supabase/public", () => ({
  createSupabasePublicClient: () => ({
    from: () => ({
      select: async () => ({ data: state.error ? null : state.rows, error: state.error }),
    }),
  }),
}));

// Import after the mock is registered.
const repo = () => import("@/lib/repository");

beforeEach(() => {
  vi.resetModules();
  state.error = null;
  state.rows = sampleCatalogue().map(toRow);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

/** Converts a model vehicle into the row shape the mock table holds. */
function toRow(v: ReturnType<typeof makeVehicle>) {
  return makeVehicleRow({
    id: v.id,
    reference: v.reference,
    brand: v.brand,
    model: v.model,
    trim: v.trim ?? null,
    year: v.year,
    price: String(v.price),
    mileage: v.mileage,
    fuel_type: v.fuelType,
    transmission: v.transmission,
    engine: v.engine,
    horsepower: v.horsepower,
    drive_type: v.driveType,
    body_type: v.bodyType,
    color: v.color,
    seats: v.seats,
    doors: v.doors,
    condition: v.condition,
    status: v.status,
    featured: v.featured,
    location: v.location,
    description: v.description,
    highlights: v.highlights,
    features: v.features,
    images: v.images,
    listed_at: v.listedAt,
  });
}

describe("repository: configuration and errors", () => {
  it("returns an empty catalogue when Supabase is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const { getAllVehicles } = await repo();
    expect(await getAllVehicles()).toEqual([]);
  });

  it("throws, rather than showing an empty catalogue, when the query fails", async () => {
    state.error = { message: "permission denied" };
    const { getAllVehicles } = await repo();
    await expect(getAllVehicles()).rejects.toThrow("Could not load vehicles from Supabase: permission denied");
  });
});

describe("repository: vehicle lookups", () => {
  it("finds a vehicle by its brand and slug", async () => {
    const { getVehicleBySlugs } = await repo();
    const found = await getVehicleBySlugs("bmw", "x5-xdrive40i-2024-pc-bmw-x5-0241");
    expect(found?.reference).toBe("PC-BMW-X5-0241");
  });

  it("returns null when the brand segment does not match", async () => {
    const { getVehicleBySlugs } = await repo();
    expect(await getVehicleBySlugs("audi", "x5-xdrive40i-2024-pc-bmw-x5-0241")).toBeNull();
  });

  it("returns null for an unknown vehicle", async () => {
    const { getVehicleBySlugs, getVehicleById } = await repo();
    expect(await getVehicleBySlugs("bmw", "m3-2020")).toBeNull();
    expect(await getVehicleById("missing")).toBeNull();
  });

  it("gives identical cars their own slugs so each one can be opened", async () => {
    // Two cars with the same model, trim and year must both resolve.
    const twin = { ...toRow(makeVehicle()), id: "v-twin", reference: "PC-BMW-X5-0242" };
    state.rows = [toRow(makeVehicle()), twin];
    const { getAllVehicles, getVehicleBySlugs } = await repo();
    const all = await getAllVehicles();
    const paths = await Promise.all(all.map((v) => getVehicleBySlugs(brandSlug(v), vehicleSlug(v))));
    expect(paths.map((v) => v?.reference)).toEqual(["PC-BMW-X5-0241", "PC-BMW-X5-0242"]);
  });
});

describe("repository: listings", () => {
  it("keeps sold vehicles out of the featured strip", async () => {
    const { getFeaturedVehicles } = await repo();
    const featured = await getFeaturedVehicles(10);
    expect(featured.every((v) => v.status !== "Sold")).toBe(true);
    expect(featured.every((v) => v.featured)).toBe(true);
  });

  it("limits the featured strip", async () => {
    const { getFeaturedVehicles } = await repo();
    expect(await getFeaturedVehicles(1)).toHaveLength(1);
  });

  it("suggests related vehicles, excluding the one being viewed and sold cars", async () => {
    const { getAllVehicles, getRelatedVehicles } = await repo();
    const [bmw] = await getAllVehicles();
    const related = await getRelatedVehicles(bmw, 5);
    expect(related.map((v) => v.id)).not.toContain(bmw.id);
    expect(related.every((v) => v.status !== "Sold")).toBe(true);
    // Same body type and brand ranks first when one exists.
    expect(related[0].bodyType).toBe("SUV");
  });

  it("reports the filtered total alongside the unfiltered count", async () => {
    const { queryVehicles } = await repo();
    const result = await queryVehicles({ brand: ["Toyota"] });
    expect(result.total).toBe(1);
    expect(result.totalUnfiltered).toBe(5);
  });

  it("returns copies, so a caller cannot corrupt the cached catalogue", async () => {
    const { getAllVehicles } = await repo();
    const first = await getAllVehicles();
    first[0].brand = "Mutated";
    const second = await getAllVehicles();
    expect(second[0].brand).not.toBe("Mutated");
  });
});

describe("repository: photos", () => {
  it("drops photos hosted outside the allowed bucket and warns", async () => {
    state.rows = [
      toRow(
        makeVehicle({
          images: [
            { url: photo("ok"), alt: "ok", angle: "Front" },
            { url: "https://images.example.com/bad.jpg", alt: "bad", angle: "Rear" },
          ],
        }),
      ),
    ];
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getAllVehicles } = await repo();
    const [vehicle] = await getAllVehicles();
    expect(vehicle.images.map((i) => i.url)).toEqual([photo("ok")]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("PC-BMW-X5-0241"));
  });

  it("does not crash a page when a vehicle has no photos", async () => {
    state.rows = [toRow(makeVehicle({ images: [] }))];
    const { getVehicleSummaries } = await repo();
    const [summary] = await getVehicleSummaries();
    expect(summary.image).toBe("");
    expect(summary.imageAlt).toBe("BMW X5");
  });
});

describe("repository: brands", () => {
  it("counts only vehicles that are not sold", async () => {
    const { getBrandsWithCounts } = await repo();
    const brands = await getBrandsWithCounts();
    expect(brands.find((b) => b.name === "Audi")).toBeUndefined();
    expect(brands.find((b) => b.name === "BMW")?.count).toBe(1);
  });

  it("includes a brand that is in stock even when it is not in the curated list", async () => {
    // Regression: brands were only ever taken from a fixed list, so stock of any
    // other make (for example Honda) never appeared in the "Explore by brand" strip.
    state.rows = [toRow(makeVehicle({ id: "v-honda", brand: "Honda", model: "CR-V", reference: "PC-HON-1" }))];
    const { getBrandsWithCounts } = await repo();
    const brands = await getBrandsWithCounts();
    expect(brands).toEqual([expect.objectContaining({ name: "Honda", count: 1 })]);
  });

  it("does not show curated brands that have no stock", async () => {
    // A tile reading "0 vehicles" links to an empty results page.
    const { getBrandsWithCounts } = await repo();
    const brands = await getBrandsWithCounts();
    expect(brands.every((b) => b.count > 0)).toBe(true);
  });
});

describe("repository: statistics", () => {
  it("ignores sold vehicles in the inventory summary", async () => {
    const { getInventoryStats } = await repo();
    const stats = await getInventoryStats();
    expect(stats.total).toBe(4);
    expect(stats.newestYear).toBe(2025);
  });

  it("gives sensible values for an empty catalogue", async () => {
    state.rows = [];
    const { getInventoryStats, getFilterOptions } = await repo();
    expect((await getInventoryStats()).averagePrice).toBe(0);
    expect((await getFilterOptions()).priceRange).toEqual([0, 0]);
  });
});
