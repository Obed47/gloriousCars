/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from "vitest";
import { sampleCatalogue } from "../fixtures/vehicles";

vi.mock("@/lib/repository", () => ({
  getAllVehicles: async () => sampleCatalogue(),
}));

const SITE_URL = "https://www.example-dealer.test";

describe("sitemap.xml bilingual entries", () => {
  it("doubles every route into an English and a French entry", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();

    const staticRouteCount = 7; // /, /cars, /about, /services, /contact, /privacy, /terms
    const nonSoldVehicleCount = sampleCatalogue().filter((v) => v.status !== "Sold").length;
    const todaysCount = staticRouteCount + nonSoldVehicleCount;

    expect(entries.length).toBe(todaysCount * 2);
  });

  it("gives /cars a /fr/cars sibling with matching priority and change frequency", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();

    const en = entries.find((e) => e.url === `${SITE_URL}/cars`);
    const fr = entries.find((e) => e.url === `${SITE_URL}/fr/cars`);

    expect(en).toBeDefined();
    expect(fr).toBeDefined();
    expect(fr?.priority).toBe(en?.priority);
    expect(fr?.changeFrequency).toBe(en?.changeFrequency);
  });

  it("carries absolute hreflang alternates pointing both ways on the English and French entries", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();

    const en = entries.find((e) => e.url === `${SITE_URL}/cars`);
    const fr = entries.find((e) => e.url === `${SITE_URL}/fr/cars`);

    // sitemap.ts's alternates.languages is emitted as-is into <xhtml:link
    // href="...">, with no metadataBase resolution step (unlike page-level
    // generateMetadata), so these must be absolute, not localePaths()'s
    // bare relative paths.
    const expected = {
      en: `${SITE_URL}/cars`,
      fr: `${SITE_URL}/fr/cars`,
      "x-default": `${SITE_URL}/cars`,
    };
    expect(en?.alternates?.languages).toMatchObject(expected);
    expect(fr?.alternates?.languages).toMatchObject(expected);
    expect(Object.values(en?.alternates?.languages ?? {})).toEqual(
      expect.arrayContaining([expect.stringMatching(/^https?:\/\//)]),
    );
  });

  it("keeps every existing English URL present and unchanged", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    for (const path of ["/", "/cars", "/about", "/services", "/contact", "/privacy", "/terms"]) {
      expect(urls).toContain(`${SITE_URL}${path}`);
    }
  });
});
