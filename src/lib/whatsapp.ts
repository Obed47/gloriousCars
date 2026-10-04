import { SITE } from "./site";
import type { Vehicle } from "./types";
import { formatMileage, formatPrice } from "./format";
import { vehicleFullTitle } from "./slug";

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

export function vehicleInquiryMessage(vehicle: Vehicle): string {
  const title = vehicleFullTitle(vehicle);
  const price = formatPrice(vehicle.price, vehicle.currency);
  return [
    `Hello ${SITE.name}, I'm interested in this vehicle:`,
    ``,
    `Vehicle: ${title}`,
    `Reference: ${vehicle.reference}`,
    `Year: ${vehicle.year}`,
    `Price: ${price}`,
    `Mileage: ${formatMileage(vehicle.mileage)}`,
    `Fuel: ${vehicle.fuelType}`,
    `Transmission: ${vehicle.transmission}`,
    `Location: ${vehicle.location}`,
    ``,
    `I'd like to know more and how I can proceed with the purchase.`,
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
): string {
  const lines = [
    `Hello ${SITE.name}, I'd like to book a test drive.`,
    ``,
    `Vehicle: ${vehicleFullTitle(vehicle)} (Ref: ${vehicle.reference})`,
    `Name: ${details.name}`,
    details.phone ? `Phone: ${details.phone}` : null,
    details.email ? `Email: ${details.email}` : null,
    `Preferred date: ${details.date}`,
    `Preferred time: ${details.time}`,
    `Preferred location: ${details.location}`,
    details.message ? `Note: ${details.message}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export function generalInquiryMessage(): string {
  return `Hello ${SITE.name}, I'd like more information about your vehicles.`;
}

/** Opens WhatsApp in a new tab. No-op during SSR. */
export function openWhatsApp(message: string, phone?: string): void {
  if (typeof window === "undefined") return;
  window.open(buildWhatsAppUrl(message, phone), "_blank", "noopener,noreferrer");
}
