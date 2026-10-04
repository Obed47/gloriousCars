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
export type DriveType = "FWD" | "RWD" | "AWD" | "4WD";
export type BodyType =
  | "SUV"
  | "Sedan"
  | "Coupe"
  | "Hatchback"
  | "Pickup"
  | "Convertible"
  | "Wagon"
  | "Van";
export type Condition = "New" | "Used";
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

export type FeatureCategory =
  | "Comfort"
  | "Technology"
  | "Safety"
  | "Performance";

export interface FeatureGroup {
  category: FeatureCategory;
  items: string[];
}

export interface Vehicle {
  id: string;
  /** Human-facing stock reference, e.g. "PC-BMW-X5-0241". */
  reference: string;

  brand: string;
  model: string;
  trim?: string;
  year: number;

  price: number;
  currency: Currency;

  mileage: number; // kilometres
  fuelType: FuelType;
  transmission: Transmission;
  engine: string; // display string, e.g. "3.0L turbo"
  horsepower: number;
  driveType: DriveType;
  bodyType: BodyType;
  color: string;
  seats: number;
  doors: number;

  condition: Condition;
  status: VehicleStatus;
  featured: boolean;

  location: string;
  description: string;
  highlights: string[];
  features: FeatureGroup[];
  images: VehicleImage[];

  /** ISO date — powers the "Newest" sort and sitemap lastModified. */
  listedAt: string;
}

/** Options surfaced to the inventory filter UI, derived from the catalogue. */
export interface FilterOptions {
  brands: string[];
  bodyTypes: BodyType[];
  fuelTypes: FuelType[];
  transmissions: Transmission[];
  colors: string[];
  conditions: Condition[];
  years: number[];
  priceRange: [number, number];
  mileageRange: [number, number];
}

/** Lightweight vehicle projection for trays, chips and cross-references. */
export interface VehicleSummary {
  id: string;
  reference: string;
  brand: string;
  model: string;
  trim?: string;
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
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  color?: string[];
  condition?: string[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  search?: string;
  sort?: SortKey;
}
