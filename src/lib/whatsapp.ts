import { SITE } from "./site";
import type { Vehicle } from "./types";
import { formatMileage, formatPrice } from "./format";
import { vehicleFullTitle } from "./slug";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * The single WhatsApp entry point for the whole site.
 * The number lives in `SITE.whatsappNumber` — never hard-code it elsewhere.
 */
export const WHATSAPP_NUMBER = SITE.whatsappNumber;

/** Build a correctly-encoded wa.me deep link. */
export function buildWhatsAppUrl(
  message: string,
  phone: string = WHATSAPP_NUMBER,
): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/* ---- Contextual message builders ---- */

export function vehicleInquiryMessage(vehicle: Vehicle, dict: Dictionary): string {
  const t = dict.whatsapp.vehicleInquiry;
  const title = vehicleFullTitle(vehicle);
  const price = formatPrice(vehicle.price, vehicle.currency);
  return [
    t.greeting.replace("{name}", SITE.name),
    ``,
    `${t.vehicleLabel}: ${title}`,
    `${t.referenceLabel}: ${vehicle.reference}`,
    `${t.yearLabel}: ${vehicle.year}`,
    `${t.priceLabel}: ${price}`,
    `${t.mileageLabel}: ${formatMileage(vehicle.mileage)}`,
    `${t.fuelLabel}: ${vehicle.fuelType}`,
    `${t.transmissionLabel}: ${vehicle.transmission}`,
    `${t.locationLabel}: ${vehicle.location}`,
    ``,
    t.closing,
  ].join("\n");
}

export interface TestDriveDetails {
  name: string;
  phone?: string;
  email?: string;
  date: string;
  time: string;
  location: string;
  message?: string;
}

export function testDriveMessage(
  vehicle: Vehicle,
  details: TestDriveDetails,
  dict: Dictionary,
): string {
  const t = dict.whatsapp.testDrive;
  const lines = [
    t.greeting.replace("{name}", SITE.name),
    ``,
    `${t.vehicleLabel}: ${vehicleFullTitle(vehicle)} (${t.refLabel}: ${vehicle.reference})`,
    `${t.nameLabel}: ${details.name}`,
    details.phone ? `${t.phoneLabel}: ${details.phone}` : null,
    details.email ? `${t.emailLabel}: ${details.email}` : null,
    `${t.preferredDateLabel}: ${details.date}`,
    `${t.preferredTimeLabel}: ${details.time}`,
    `${t.preferredLocationLabel}: ${details.location}`,
    details.message ? `${t.noteLabel}: ${details.message}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export function generalInquiryMessage(dict: Dictionary): string {
  return dict.whatsapp.generalInquiry.replace("{name}", SITE.name);
}

/** Opens WhatsApp in a new tab. No-op during SSR. */
export function openWhatsApp(message: string, phone?: string): void {
  if (typeof window === "undefined") return;
  window.open(buildWhatsAppUrl(message, phone), "_blank", "noopener,noreferrer");
}
