import { cache } from "react";
import { unstable_cache } from "next/cache";
import { brandNames } from "@/data/brands";
import { reviews as rawReviews, type Review } from "@/data/reviews";
import type {
  FilterOptions,
  Vehicle,
  VehicleQuery,
  VehicleSummary,
} from "./types";
import { brandSlug, vehiclePath, vehicleSlug } from "./slug";
import {
  deriveFilterOptions,
  filterVehicles,
  sortVehicles,
} from "./filtering";
import { isAllowedImageUrl } from "./images";
import { CATALOGUE_TAG } from "./catalogueCache";
import { isSupabaseConfigured } from "./supabase/env";
import { createSupabasePublicClient } from "./supabase/public";
import { rowToVehicle, type VehicleRow } from "./supabase/vehicles";

/**
 * ── DATA ACCESS LAYER ─────────────────────────────────────────────────
 * The rest of the app only ever talks to these functions. Vehicles come
 * from Supabase (`public.vehicles`) and are added through the admin; when
 * the Supabase env vars are not set at all the catalogue is simply empty.
 *
 * Every function is async on purpose so callers already `await`.
 */

const clone = <T,>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const selectVehicleRows = () =>
  createSupabasePublicClient().from("vehicles").select("*");

/**
 * The catalogue, shared by every request. Without this, each page render
 * waited on its own Supabase round trip, which made every navigation slow.
 * Uses the cookie-less client, so row-level security applies as for an
 * anonymous visitor (sold vehicles are hidden). A failed query throws and is
 * not cached, so the next request tries again.
 */
const fetchCatalogue = unstable_cache(
  async (): Promise<Vehicle[]> => {
    let result = await selectVehicleRows();
    // Status 0 means no HTTP response at all (a dropped connection), so one
    // retry is worth it. Any real error from Supabase still fails straight away.
    if (result.error && result.status === 0) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      result = await selectVehicleRows();
    }
    const { data, error } = result;
    if (error) {
      throw new Error(`Could not load vehicles from Supabase: ${error.message}`);
    }
    return (data as VehicleRow[]).map(rowToVehicle).map(dropUnrenderablePhotos);
  },
  ["vehicle-catalogue"],
  // Five minutes is the fallback for rows changed directly in the Supabase
  // dashboard; admin saves expire the cache at once through CATALOGUE_TAG.
  { tags: [CATALOGUE_TAG], revalidate: 300 },
);

/** One lookup per request, so a page and its layout share a single read. */
const loadVehicles = cache(async (): Promise<Vehicle[]> => {
  if (!isSupabaseConfigured()) return [];
  return fetchCatalogue();
});

/**
 * `next/image` throws for hosts missing from `images.remotePatterns`, which
 * would take down every page showing the vehicle. The admin refuses such
 * links, but a row edited directly in the Supabase dashboard can still hold
 * one, so filter here, at the single door photos come through.
 */
function dropUnrenderablePhotos(vehicle: Vehicle): Vehicle {
  const images = vehicle.images.filter((image) => isAllowedImageUrl(image.url));
  if (images.length !== vehicle.images.length) {
    console.warn(
      `[vehicles] ${vehicle.reference}: ignoring ${vehicle.images.length - images.length} photo(s) on a host that isn't allowed (see src/lib/images.ts).`,
    );
  }
  return { ...vehicle, images };
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  return clone(await loadVehicles());
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const rawVehicles = await loadVehicles();
  return clone(rawVehicles.find((v) => v.id === id) ?? null);
}

export async function getVehiclesByIds(ids: string[]): Promise<Vehicle[]> {
  const rawVehicles = await loadVehicles();
  const set = new Set(ids);
  return clone(rawVehicles.filter((v) => set.has(v.id)));
}

/** Resolves the `/cars/[brand]/[slug]` route back to a vehicle. */
export async function getVehicleBySlugs(
  brand: string,
  slug: string,
): Promise<Vehicle | null> {
  const rawVehicles = await loadVehicles();
  const match = rawVehicles.find(
    (v) => brandSlug(v) === brand && vehicleSlug(v) === slug,
  );
  return clone(match ?? null);
}

export async function getFeaturedVehicles(limit = 6): Promise<Vehicle[]> {
  const rawVehicles = await loadVehicles();
  const featured = sortVehicles(
    rawVehicles.filter((v) => v.featured && v.status !== "Sold"),
    "featured",
  );
  return clone(featured.slice(0, limit));
}

export async function getRelatedVehicles(
  vehicle: Vehicle,
  limit = 3,
): Promise<Vehicle[]> {
  const rawVehicles = await loadVehicles();
  const scored = rawVehicles
    .filter((v) => v.id !== vehicle.id && v.status !== "Sold")
    .map((v) => {
      let score = 0;
      if (v.brand === vehicle.brand) score += 2;
      if (v.fuelType === vehicle.fuelType) score += 1;
      if (Math.abs(v.price - vehicle.price) < 15000) score += 1;
      return { v, score };
    })
    .sort((a, b) => b.score - a.score || b.v.price - a.v.price);
  return clone(scored.slice(0, limit).map((s) => s.v));
}

export interface QueryResult {
  items: Vehicle[];
  total: number;
  totalUnfiltered: number;
}

export async function queryVehicles(query: VehicleQuery): Promise<QueryResult> {
  const rawVehicles = await loadVehicles();
  const filtered = filterVehicles(rawVehicles, query);
  const sorted = sortVehicles(filtered, query.sort);
  return {
    items: clone(sorted),
    total: sorted.length,
    totalUnfiltered: rawVehicles.length,
  };
}

export async function getFilterOptions(): Promise<FilterOptions> {
  return deriveFilterOptions(await loadVehicles());
}

export function toSummary(v: Vehicle): VehicleSummary {
  return {
    id: v.id,
    reference: v.reference,
    brand: v.brand,
    name: v.name,
    year: v.year,
    price: v.price,
    currency: v.currency,
    image: v.images[0]?.url ?? "",
    imageAlt: v.images[0]?.alt ?? v.name,
    path: vehiclePath(v),
    status: v.status,
  };
}

export async function getVehicleSummaries(): Promise<VehicleSummary[]> {
  return (await loadVehicles()).map(toSummary);
}

export interface BrandSummary {
  name: string;
  slug: string;
  count: number;
}

/**
 * Brands with at least one vehicle for sale. Taken from the stock itself, so a
 * make that is not in the curated list still appears, and a curated make with
 * no stock does not show as an empty "0 vehicles" tile.
 */
export async function getBrandsWithCounts(): Promise<BrandSummary[]> {
  const rawVehicles = await loadVehicles();
  const counts = new Map<string, number>();
  for (const v of rawVehicles) {
    if (v.status === "Sold") continue;
    counts.set(v.brand, (counts.get(v.brand) ?? 0) + 1);
  }
  const names = new Set([...brandNames, ...counts.keys()]);
  return [...names]
    .map((name) => ({ name, slug: brandSlug({ brand: name }), count: counts.get(name) ?? 0 }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getReviews(): Promise<Review[]> {
  return clone(rawReviews);
}

export async function getInventoryStats(): Promise<{
  total: number;
  brands: number;
  averagePrice: number;
  newestYear: number;
}> {
  const active = (await loadVehicles()).filter((v) => v.status !== "Sold");
  return {
    total: active.length,
    brands: new Set(active.map((v) => v.brand)).size,
    averagePrice: Math.round(
      active.reduce((sum, v) => sum + v.price, 0) / Math.max(active.length, 1),
    ),
    newestYear: active.length
      ? Math.max(...active.map((v) => v.year))
      : new Date().getFullYear(),
  };
}
