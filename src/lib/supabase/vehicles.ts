import type {
  Currency,
  FuelType,
  Transmission,
  Vehicle,
  VehicleImage,
  VehicleStatus,
} from "@/lib/types";

/** Shape of a row in `public.vehicles` (snake_case). */
export interface VehicleRow {
  id: string;
  reference: string;
  name: string;
  brand: string;
  year: number;
  price: number | string;
  currency: Currency;
  mileage: number;
  fuel_type: FuelType;
  transmission: Transmission;
  color: string;
  seats: number;
  doors: number;
  status: VehicleStatus;
  featured: boolean;
  location: string;
  description: string;
  images: VehicleImage[];
  listed_at: string;
}

/** A vehicle as edited in the admin: everything except the generated fields. */
export type VehicleInput = Omit<Vehicle, "id" | "listedAt">;

export function rowToVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    reference: row.reference,
    name: row.name,
    brand: row.brand,
    year: row.year,
    price: Number(row.price),
    currency: row.currency,
    mileage: row.mileage,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    color: row.color,
    seats: row.seats,
    doors: row.doors,
    status: row.status,
    featured: row.featured,
    location: row.location,
    description: row.description,
    images: row.images ?? [],
    listedAt: new Date(row.listed_at).toISOString(),
  };
}

export function vehicleToRow(v: VehicleInput): Omit<VehicleRow, "id" | "listed_at"> {
  return {
    reference: v.reference,
    name: v.name,
    brand: v.brand,
    year: v.year,
    price: v.price,
    currency: v.currency,
    mileage: v.mileage,
    fuel_type: v.fuelType,
    transmission: v.transmission,
    color: v.color,
    seats: v.seats,
    doors: v.doors,
    status: v.status,
    featured: v.featured,
    location: v.location,
    description: v.description,
    images: v.images,
  };
}
