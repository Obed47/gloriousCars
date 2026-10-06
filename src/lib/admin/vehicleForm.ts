import type {
  FuelType,
  ImageAngle,
  Transmission,
  Vehicle,
  VehicleImage,
  VehicleStatus,
} from "@/lib/types";
import type { VehicleInput } from "@/lib/supabase/vehicles";
import { isAllowedImageUrl } from "@/lib/images";
import { brandFromName } from "@/data/brands";

/**
 * Admin vehicle form: option lists, the string-only draft the form holds
 * (so a failed submit can be re-shown exactly as typed) and the validation
 * that turns a draft into a `VehicleInput`. Rules mirror the CHECK
 * constraints in the vehicles table.
 */

export const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"] as const satisfies readonly FuelType[];
export const TRANSMISSIONS = ["Automatic", "Manual"] as const satisfies readonly Transmission[];
export const STATUSES = ["Available", "Reserved", "Sold"] as const satisfies readonly VehicleStatus[];
export const IMAGE_ANGLES = [
  "Front",
  "Side profile",
  "Rear",
  "Interior",
  "Dashboard",
  "Wheels",
  "Engine",
  "Exterior",
] as const satisfies readonly ImageAngle[];

export interface ImageDraft {
  url: string;
  alt: string;
  angle: string;
}

export interface VehicleDraft {
  reference: string;
  /** Make and model together, e.g. "Toyota Land Cruiser Prado". */
  name: string;
  year: string;
  price: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  color: string;
  seats: string;
  doors: string;
  status: string;
  featured: boolean;
  location: string;
  description: string;
  images: ImageDraft[];
}

export interface SaveState {
  draft: VehicleDraft;
  errors: Record<string, string>;
  message?: string;
}

export function emptyDraft(): VehicleDraft {
  return {
    reference: "",
    name: "",
    year: String(new Date().getFullYear()),
    price: "",
    mileage: "0",
    fuelType: "Petrol",
    transmission: "Automatic",
    color: "",
    seats: "5",
    doors: "5",
    status: "Available",
    featured: false,
    location: "",
    description: "",
    images: [{ url: "", alt: "", angle: "Front" }],
  };
}

export function draftFromVehicle(v: Vehicle): VehicleDraft {
  return {
    reference: v.reference,
    name: v.name,
    year: String(v.year),
    price: String(v.price),
    mileage: String(v.mileage),
    fuelType: v.fuelType,
    transmission: v.transmission,
    color: v.color,
    seats: String(v.seats),
    doors: String(v.doors),
    status: v.status,
    featured: v.featured,
    location: v.location,
    description: v.description,
    images: v.images.length
      ? v.images.map((i) => ({ url: i.url, alt: i.alt, angle: i.angle }))
      : [{ url: "", alt: "", angle: "Front" }],
  };
}

export function draftFromFormData(fd: FormData): VehicleDraft {
  const str = (name: string) => String(fd.get(name) ?? "").trim();
  const urls = fd.getAll("image_url").map(String);
  const alts = fd.getAll("image_alt").map(String);
  const angles = fd.getAll("image_angle").map(String);

  return {
    reference: str("reference"),
    name: str("name"),
    year: str("year"),
    price: str("price"),
    mileage: str("mileage"),
    fuelType: str("fuelType"),
    transmission: str("transmission"),
    color: str("color"),
    seats: str("seats"),
    doors: str("doors"),
    status: str("status"),
    featured: fd.get("featured") === "on",
    location: str("location"),
    description: str("description"),
    images: urls.map((url, i) => ({
      url: url.trim(),
      alt: (alts[i] ?? "").trim(),
      angle: angles[i] ?? "Exterior",
    })),
  };
}

/** Explains a rejected photo link without echoing a multi-hundred-character URL. */
function imageUrlError(raw: string): string {
  let host = "";
  try {
    host = new URL(raw).hostname;
  } catch {
    return "One of the photo links is not a valid URL. Upload the photo from your device instead.";
  }
  return `Photos can't be loaded from ${host}. Download the picture and upload the file from your device instead.`;
}

type Result =
  | { ok: true; value: VehicleInput }
  | { ok: false; errors: Record<string, string> };

export function validateDraft(d: VehicleDraft): Result {
  const errors: Record<string, string> = {};

  const required = (key: keyof VehicleDraft, label: string) => {
    if (!String(d[key]).trim()) errors[key] = `${label} is required.`;
  };
  required("reference", "Reference");
  required("name", "Car name");
  required("color", "Colour");
  required("location", "Location");
  required("description", "Description");

  const integer = (key: keyof VehicleDraft, label: string, min: number, max = Infinity) => {
    const raw = String(d[key]).trim();
    if (!/^\d+$/.test(raw)) {
      errors[key] = `${label} must be a whole number.`;
      return 0;
    }
    const n = Number(raw);
    if (n < min || n > max) {
      errors[key] =
        max === Infinity
          ? `${label} must be at least ${min}.`
          : `${label} must be between ${min} and ${max}.`;
    }
    return n;
  };
  const year = integer("year", "Year", 1900, 2100);
  const mileage = integer("mileage", "Mileage", 0);
  const seats = integer("seats", "Seats", 1);
  const doors = integer("doors", "Doors", 1);

  const priceRaw = d.price.replace(/[\s,]/g, "");
  const price = Number(priceRaw);
  if (!priceRaw || !Number.isFinite(price) || price < 0) {
    errors.price = "Price must be a number, 0 or more.";
  }

  const oneOf = <T extends string>(key: keyof VehicleDraft, list: readonly T[], label: string) => {
    const value = String(d[key]);
    if (!list.includes(value as T)) errors[key] = `Choose a valid ${label}.`;
    return value as T;
  };
  const fuelType = oneOf("fuelType", FUEL_TYPES, "fuel type");
  const transmission = oneOf("transmission", TRANSMISSIONS, "transmission");
  const status = oneOf("status", STATUSES, "status");

  const images: VehicleImage[] = [];
  for (const row of d.images) {
    if (!row.url) continue; // blank rows are ignored
    if (!isAllowedImageUrl(row.url)) {
      errors.images = imageUrlError(row.url);
      break;
    }
    images.push({
      url: row.url,
      alt: row.alt || d.name.trim(),
      angle: IMAGE_ANGLES.includes(row.angle as ImageAngle)
        ? (row.angle as ImageAngle)
        : "Exterior",
    });
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const name = d.name.trim();
  return {
    ok: true,
    value: {
      reference: d.reference,
      name,
      brand: brandFromName(name),
      year,
      price,
      currency: "XAF",
      mileage,
      fuelType,
      transmission,
      color: d.color,
      seats,
      doors,
      status,
      featured: d.featured,
      location: d.location,
      description: d.description,
      images,
    },
  };
}
