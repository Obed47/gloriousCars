import type { VehicleInput, VehicleRow } from "@/lib/supabase/vehicles";
import type { Vehicle } from "@/lib/types";

export const STORAGE_HOST = "https://test-project.supabase.co";
export const photo = (name: string) =>
  `${STORAGE_HOST}/storage/v1/object/public/vehicle-images/vehicles/${name}.jpg`;

export function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: "v-bmw-x5-xdrive40i-2024-abc123",
    reference: "PC-BMW-X5-0241",
    name: "BMW X5 xDrive40i",
    brand: "BMW",
    year: 2024,
    price: 68_500_000,
    currency: "XAF",
    mileage: 12_000,
    fuelType: "Petrol",
    transmission: "Automatic",
    color: "Alpine White",
    seats: 5,
    doors: 5,
    status: "Available",
    featured: true,
    location: "Yaoundé — Bastos Branch",
    description: "Well maintained, full service history.",
    images: [{ url: photo("bmw-front"), alt: "BMW X5 front", angle: "Front" }],
    listedAt: "2026-09-01T10:00:00.000Z",
    ...overrides,
  };
}

/** A small, varied catalogue for filter and search tests. */
export function sampleCatalogue(): Vehicle[] {
  return [
    makeVehicle(),
    makeVehicle({
      id: "v-toyota-rav4-hybrid-2023-def456",
      reference: "PC-TOY-RAV4-0102",
      name: "Toyota RAV4 Hybrid",
      brand: "Toyota",
      year: 2023,
      price: 21_900_000,
      mileage: 38_000,
      fuelType: "Hybrid",
      transmission: "Automatic",
      color: "Silver",
      featured: false,
      listedAt: "2026-08-15T10:00:00.000Z",
      images: [{ url: photo("rav4-front"), alt: "Toyota RAV4", angle: "Front" }],
    }),
    makeVehicle({
      id: "v-vw-golf-2019-ghi789",
      reference: "PC-VW-GOLF-0007",
      name: "Volkswagen Golf",
      brand: "Volkswagen",
      year: 2019,
      price: 9_800_000,
      mileage: 96_000,
      fuelType: "Diesel",
      transmission: "Manual",
      color: "Black",
      featured: false,
      listedAt: "2026-07-01T10:00:00.000Z",
      images: [{ url: photo("golf-front"), alt: "VW Golf", angle: "Front" }],
    }),
    makeVehicle({
      id: "v-tesla-model3-2025-jkl012",
      reference: "PC-TES-M3-0300",
      name: "Tesla Model 3 Long Range",
      brand: "Tesla",
      year: 2025,
      price: 47_000_000,
      mileage: 4_000,
      fuelType: "Electric",
      transmission: "Automatic",
      color: "Red",
      featured: true,
      status: "Reserved",
      listedAt: "2026-09-20T10:00:00.000Z",
      images: [],
    }),
    makeVehicle({
      id: "v-audi-a4-2020-mno345",
      reference: "PC-AUD-A4-0450",
      name: "Audi A4",
      brand: "Audi",
      year: 2020,
      price: 15_500_000,
      mileage: 61_000,
      fuelType: "Petrol",
      transmission: "Automatic",
      color: "Grey",
      featured: false,
      status: "Sold",
      listedAt: "2026-06-01T10:00:00.000Z",
      images: [{ url: photo("a4-front"), alt: "Audi A4", angle: "Front" }],
    }),
  ];
}

/** The snake_case row shape Supabase returns for a vehicle. */
export function makeVehicleRow(overrides: Partial<VehicleRow> = {}): VehicleRow {
  return {
    id: "v-bmw-x5-xdrive40i-2024-abc123",
    reference: "PC-BMW-X5-0241",
    name: "BMW X5 xDrive40i",
    brand: "BMW",
    year: 2024,
    price: "68500000",
    currency: "XAF",
    mileage: 12000,
    fuel_type: "Petrol",
    transmission: "Automatic",
    color: "Alpine White",
    seats: 5,
    doors: 5,
    status: "Available",
    featured: true,
    location: "Yaoundé — Bastos Branch",
    description: "Well maintained, full service history.",
    images: [{ url: photo("bmw-front"), alt: "BMW X5 front", angle: "Front" }],
    listed_at: "2026-09-01T10:00:00.000Z",
    ...overrides,
  };
}

/** A vehicle as the admin form submits it: no database-generated fields. */
export function toVehicleInput(v: Vehicle): VehicleInput {
  const input: Partial<Vehicle> = { ...v };
  delete input.id;
  delete input.listedAt;
  return input as VehicleInput;
}
