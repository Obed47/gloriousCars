import { expect, type Page } from "@playwright/test";

/** The dealership WhatsApp number from SITE.whatsappNumber. */
export const WHATSAPP_NUMBER = "237675938792";

/** Known catalogue entries, from tests/e2e/fixtures/catalogue.json. */
export const CARS = {
  bmwWhite: { path: "/cars/bmw/bmw-x5-xdrive40i-2024-pc-bmw-x5-0241", reference: "PC-BMW-X5-0241", title: "2024 BMW X5 xDrive40i" },
  bmwBlack: { path: "/cars/bmw/bmw-x5-xdrive40i-2024-pc-bmw-x5-0242", reference: "PC-BMW-X5-0242", title: "2024 BMW X5 xDrive40i" },
  rav4: { path: "/cars/toyota/toyota-rav4-hybrid-2023-pc-toy-rav4-0102", reference: "PC-TOY-RAV4-0102", title: "2023 Toyota RAV4 Hybrid" },
  golf: { path: "/cars/volkswagen/volkswagen-golf-2019-pc-vw-golf-0007", reference: "PC-VW-GOLF-0007", title: "2019 Volkswagen Golf" },
  tesla: { path: "/cars/tesla/tesla-model-3-long-range-2025-pc-tes-m3-0300", reference: "PC-TES-M3-0300", title: "2025 Tesla Model 3 Long Range" },
  sold: { path: "/cars/audi/audi-a4-2020-pc-aud-a4-0450", reference: "PC-AUD-A4-0450", title: "2020 Audi A4" },
} as const;

/** Every page a visitor can open without signing in. */
export const PUBLIC_PAGES = [
  "/",
  "/cars",
  CARS.bmwWhite.path,
  "/compare",
  "/favorites",
  "/about",
  "/services",
  "/contact",
  "/privacy",
  "/terms",
  "/login",
];

/**
 * The message text from a WhatsApp link. wa.me redirects to api.whatsapp.com,
 * so read it from the final URL, where spaces are "+" and accents are encoded.
 */
export function whatsappText(url: string): string {
  return new URL(url).searchParams.get("text") ?? "";
}

/** Collects errors logged to the console or thrown on the page. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Fails when the page is wider than the screen (sideways scrolling). */
export async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "page is wider than the screen").toBeLessThanOrEqual(1);
}

/** Vehicle cards on the inventory page, by their heading text. */
export function carCards(page: Page) {
  return page.locator("article").filter({ has: page.getByRole("heading", { level: 3 }) });
}
