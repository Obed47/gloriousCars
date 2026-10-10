import type { Currency } from "./types";

/**
 * Central configuration for the dealership.
 *
 * ── WhatsApp ───────────────────────────────────────────────────────────
 * `whatsappNumber` is the single source of truth for every WhatsApp CTA on
 * the site (vehicle enquiries, test-drive requests, floating button, footer).
 * Use full international format, digits only, no "+" or spaces.
 * Example for Cameroon: "2376XXXXXXXX".
 *
 * ── Stats ──────────────────────────────────────────────────────────────
 * The figures in `stats` are PLACEHOLDERS. Replace them with verified
 * business numbers before launch, or remove the section.
 */
export const SITE = {
  name: "Glorious Cars",
  legalName: "Glorious Cars Motors",
  tagline: "Cars for sale in Yaoundé and Cameroon.",
  description:
    "Shop quality cars for sale in Yaoundé, Douala and across Cameroon. Compare inspected vehicles, view transparent prices and book a test drive with Glorious Cars.",

  /** Used for absolute URLs in metadata, Open Graph and the sitemap. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gloriouscars.example.com",
  locale: "en",

  defaultCurrency: "XAF" as Currency,

  /* ---- Contact / conversion ---- */
  whatsappNumber: "237675938792",
  phoneDisplay: "+237 675938792",
  email: "gloriouscars237@gmail.com",

  address: {
    line: "Biyem-Assi Branch",
    city: "Yaoundé",
    country: "Cameroon",
  },

  serviceAreas: ["Yaoundé", "Douala", "Cameroon"],

  hours: [
    { days: "Monday – Friday", time: "08:00 – 18:00" },
    { days: "Saturday", time: "09:00 – 16:00" },
    { days: "Sunday", time: "By appointment" },
  ],

  /** Test-drive / pickup locations offered in the booking flow. */
  locations: [
    "Yaoundé — Biyem-Assi Branch",
    "Douala — Akwa Showroom",
    "Douala — Bonabéri Lot",
  ],

  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    linkedin: "https://linkedin.com",
  },

  /** PLACEHOLDER figures — replace with verified numbers or delete. */
  stats: [
    { value: "150+", label: "Vehicles in stock" },
    { value: "500+", label: "Happy clients" },
    { value: "10+", label: "Years on the road" },
    { value: "24/7", label: "WhatsApp assistance" },
  ],
} as const;

export type SiteConfig = typeof SITE;
