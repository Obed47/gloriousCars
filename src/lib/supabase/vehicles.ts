import type {
  BodyType,
  Condition,
  Currency,
  DriveType,
  FeatureGroup,
  FuelType,
  Transmission,
  Vehicle,
  VehicleImage,
  VehicleStatus,
} from "@/lib/types";

/** Shape of a row in `public.vehicles` (snake_case, nullable trim). */
export interface VehicleRow {
  id: string;
  reference: string;
  brand: string;
  model: string;
  trim: string | null;
  year: number;
  price: number | string;
  currency: Currency;
  mileage: number;
  fuel_type: FuelType;
  transmission: Transmission;
  engine: string;
  horsepower: number;
  drive_type: DriveType;
  body_type: BodyType;
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
  listed_at: string;
}

/** A vehicle as edited in the admin: everything except the generated fields. */
export type VehicleInput = Omit<Vehicle, "id" | "listedAt">;

export function rowToVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    reference: row.reference,
    brand: row.brand,
    model: row.model,
    trim: row.trim ?? undefined,
    year: row.year,
    price: Number(row.price),
    currency: row.currency,
    mileage: row.mileage,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    engine: row.engine,
    horsepower: row.horsepower,
    driveType: row.drive_type,
    bodyType: row.body_type,
    color: row.color,
    seats: row.seats,
    doors: row.doors,
    condition: row.condition,
    status: row.status,
    featured: row.featured,
    location: row.location,
    description: row.description,
    highlights: row.highlights ?? [],
    features: row.features ?? [],
    images: row.images ?? [],
    listedAt: new Date(row.listed_at).toISOString(),
  };
}

export function vehicleToRow(v: VehicleInput): Omit<VehicleRow, "id" | "listed_at"> {
  return {
    reference: v.reference,
    brand: v.brand,
    model: v.model,
    trim: v.trim ?? null,
    year: v.year,
    price: v.price,
    currency: v.currency,
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
  };
}
