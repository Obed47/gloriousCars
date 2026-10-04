import type {
  BodyType,
  Condition,
  DriveType,
  FeatureCategory,
  FeatureGroup,
  FuelType,
  ImageAngle,
  Transmission,
  Vehicle,
  VehicleImage,
  VehicleStatus,
} from "@/lib/types";
import type { VehicleInput } from "@/lib/supabase/vehicles";
import { isAllowedImageUrl } from "@/lib/images";

/**
 * Admin vehicle form: option lists, the string-only draft the form holds
 * (so a failed submit can be re-shown exactly as typed) and the validation
 * that turns a draft into a `VehicleInput`. Rules mirror the CHECK
 * constraints in the vehicles table.
 */

export const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"] as const satisfies readonly FuelType[];
export const TRANSMISSIONS = ["Automatic", "Manual"] as const satisfies readonly Transmission[];
export const DRIVE_TYPES = ["FWD", "RWD", "AWD", "4WD"] as const satisfies readonly DriveType[];
export const BODY_TYPES = [
  "SUV",
  "Sedan",
  "Coupe",
  "Hatchback",
  "Pickup",
  "Convertible",
  "Wagon",
  "Van",
] as const satisfies readonly BodyType[];
export const CONDITIONS = ["New", "Used"] as const satisfies readonly Condition[];
export const STATUSES = ["Available", "Reserved", "Sold"] as const satisfies readonly VehicleStatus[];
export const FEATURE_CATEGORIES = [
  "Comfort",
  "Technology",
  "Safety",
  "Performance",
] as const satisfies readonly FeatureCategory[];
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
  brand: string;
  model: string;
  trim: string;
  year: string;
  price: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  engine: string;
  horsepower: string;
  driveType: string;
  bodyType: string;
  color: string;
  seats: string;
  doors: string;
  condition: string;
  status: string;
  featured: boolean;
  location: string;
  description: string;
  /** One highlight per line. */
  highlights: string;
  /** One feature per line, per category. */
  features: Record<FeatureCategory, string>;
  images: ImageDraft[];
}

export interface SaveState {
  draft: VehicleDraft;
  errors: Record<string, string>;
  message?: string;
}

const lines = (text: string): string[] =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

export function emptyDraft(): VehicleDraft {
  return {
    reference: "",
    brand: "",
    model: "",
    trim: "",
    year: String(new Date().getFullYear()),
    price: "",
    mileage: "0",
    fuelType: "Petrol",
    transmission: "Automatic",
    engine: "",
    horsepower: "0",
    driveType: "FWD",
    bodyType: "SUV",
    color: "",
    seats: "5",
    doors: "5",
    condition: "Used",
    status: "Available",
    featured: false,
    location: "",
    description: "",
    highlights: "",
    features: { Comfort: "", Technology: "", Safety: "", Performance: "" },
    images: [{ url: "", alt: "", angle: "Front" }],
  };
}

export function draftFromVehicle(v: Vehicle): VehicleDraft {
  const features = emptyDraft().features;
  for (const group of v.features) {
    features[group.category] = group.items.join("\n");
  }
  return {
    reference: v.reference,
    brand: v.brand,
    model: v.model,
    trim: v.trim ?? "",
    year: String(v.year),
    price: String(v.price),
    mileage: String(v.mileage),
    fuelType: v.fuelType,
    transmission: v.transmission,
    engine: v.engine,
    horsepower: String(v.horsepower),
    driveType: v.driveType,
    bodyType: v.bodyType,
    color: v.color,
    seats: String(v.seats),
    doors: String(v.doors),
    condition: v.condition,
    status: v.status,
    featured: v.featured,
    location: v.location,
    description: v.description,
    highlights: v.highlights.join("\n"),
    features,
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
    brand: str("brand"),
    model: str("model"),
    trim: str("trim"),
    year: str("year"),
    price: str("price"),
    mileage: str("mileage"),
    fuelType: str("fuelType"),
    transmission: str("transmission"),
    engine: str("engine"),
    horsepower: str("horsepower"),
    driveType: str("driveType"),
    bodyType: str("bodyType"),
    color: str("color"),
    seats: str("seats"),
    doors: str("doors"),
    condition: str("condition"),
    status: str("status"),
    featured: fd.get("featured") === "on",
    location: str("location"),
    description: str("description"),
    highlights: String(fd.get("highlights") ?? ""),
    features: {
      Comfort: String(fd.get("features_Comfort") ?? ""),
      Technology: String(fd.get("features_Technology") ?? ""),
      Safety: String(fd.get("features_Safety") ?? ""),
      Performance: String(fd.get("features_Performance") ?? ""),
    },
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
  required("brand", "Brand");
  required("model", "Model");
  required("engine", "Engine");
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
  const horsepower = integer("horsepower", "Horsepower", 0);
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
  const driveType = oneOf("driveType", DRIVE_TYPES, "drive type");
  const bodyType = oneOf("bodyType", BODY_TYPES, "body type");
  const condition = oneOf("condition", CONDITIONS, "condition");
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
      alt: row.alt || `${d.brand} ${d.model}`.trim(),
      angle: IMAGE_ANGLES.includes(row.angle as ImageAngle)
        ? (row.angle as ImageAngle)
        : "Exterior",
    });
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const features: FeatureGroup[] = FEATURE_CATEGORIES.map((category) => ({
    category,
    items: lines(d.features[category]),
  })).filter((g) => g.items.length > 0);

  return {
    ok: true,
    value: {
      reference: d.reference,
      brand: d.brand,
      model: d.model,
      trim: d.trim || undefined,
      year,
      price,
      currency: "XAF",
      mileage,
      fuelType,
      transmission,
      engine: d.engine,
      horsepower,
      driveType,
      bodyType,
      color: d.color,
      seats,
      doors,
      condition,
      status,
      featured: d.featured,
      location: d.location,
      description: d.description,
      highlights: lines(d.highlights),
      features,
      images,
    },
  };
}
