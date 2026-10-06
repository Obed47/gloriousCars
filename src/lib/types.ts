/**
 * Domain model for the vehicle catalogue.
 *
 * Everything the UI renders about a car flows through `Vehicle`. Keeping this
 * shape stable means the data source underneath the repository layer
 * (local file today; a DB, CMS or inventory API tomorrow) can change freely.
 */

export type Currency = "XAF";

export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric";
export type Transmission = "Automatic" | "Manual";
export type VehicleStatus = "Available" | "Reserved" | "Sold";

export type ImageAngle =
  | "Front"
  | "Side profile"
  | "Rear"
  | "Interior"
  | "Dashboard"
  | "Wheels"
  | "Engine"
  | "Exterior";

export interface VehicleImage {
  url: string;
  alt: string;
  angle: ImageAngle;
}

export interface Vehicle {
  id: string;
  /** Human-facing stock reference, e.g. "PC-BMW-X5-0241". */
  reference: string;

  /** Make and model as shown to visitors, e.g. "BMW X5 xDrive40i". */
  name: string;
  /** The make, taken from the start of `name`. Drives brand browsing and filters. */
  brand: string;
  year: number;

  price: number;
  currency: Currency;

  mileage: number; // kilometres
  fuelType: FuelType;
  transmission: Transmission;
  color: string;
  seats: number;
  doors: number;

  status: VehicleStatus;
  featured: boolean;

  location: string;
  description: string;
  images: VehicleImage[];

  /** ISO date — powers the "Newest" sort and sitemap lastModified. */
  listedAt: string;
}

/** Options surfaced to the inventory filter UI, derived from the catalogue. */
export interface FilterOptions {
  brands: string[];
  fuelTypes: FuelType[];
  transmissions: Transmission[];
  colors: string[];
  years: number[];
  priceRange: [number, number];
  mileageRange: [number, number];
}

/** Lightweight vehicle projection for trays, chips and cross-references. */
export interface VehicleSummary {
  id: string;
  reference: string;
  brand: string;
  name: string;
  year: number;
  price: number;
  currency: Currency;
  image: string;
  imageAlt: string;
  path: string;
  status: VehicleStatus;
}

export type SortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "mileage-asc";

export interface VehicleQuery {
  brand?: string[];
  fuelType?: string[];
  transmission?: string[];
  color?: string[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  search?: string;
  sort?: SortKey;
}
