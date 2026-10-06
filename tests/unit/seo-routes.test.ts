/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from "vitest";
import { sampleCatalogue } from "../fixtures/vehicles";

vi.mock("@/lib/repository", () => ({
  getAllVehicles: async () => sampleCatalogue(),
}));

const SITE_URL = "https://www.example-dealer.test";

describe("sitemap.xml", () => {
  it("lists the static pages and every public vehicle with absolute URLs", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    for (const path of ["/", "/cars", "/about", "/services", "/contact", "/privacy", "/terms"]) {
      expect(urls).toContain(`${SITE_URL}${path}`);
    }
    expect(urls.every((u) => u.startsWith(SITE_URL))).toBe(true);
  });

  it("excludes sold vehicles, which are hidden from the public site", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls.some((u) => u.includes("a4"))).toBe(false);
    expect(urls.filter((u) => u.includes("/cars/")).length).toBe(sampleCatalogue().length - 1);
  });

  it("gives every vehicle URL a last-modified date", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const vehicleEntries = (await sitemap()).filter((e) => e.url.includes("/cars/"));
    expect(vehicleEntries.every((e) => e.lastModified instanceof Date)).toBe(true);
  });
});

describe("robots.txt", () => {
  it("allows the public site and keeps staff and personal pages out of search", async () => {
    const { default: robots } = await import("@/app/robots");
    const rules = robots();
    const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
    expect(rule).toMatchObject({ userAgent: "*", allow: "/" });
    expect(rule).toMatchObject({ disallow: expect.arrayContaining(["/admin", "/login", "/favorites", "/compare"]) });
    expect(rules.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});

describe("web app manifest", () => {
  it("is installable as a standalone app starting at the home page", async () => {
    const { default: manifest } = await import("@/app/manifest");
    const m = manifest();
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
    expect(m.icons?.length).toBeGreaterThan(0);
  });
});

describe("vehicle paths used by sitemap", () => {
  it("uses the same unique path as the detail page", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    expect(entries.some((e) => e.url.endsWith("/cars/bmw/bmw-x5-xdrive40i-2024-pc-bmw-x5-0241"))).toBe(true);
  });
});
