import { expect, test } from "@playwright/test";
import { E2E_PORT } from "../../scripts/e2e-env.mjs";
import { CARS, PUBLIC_PAGES } from "./support/helpers";

const ORIGIN = `http://localhost:${E2E_PORT}`;

test.describe("staff area", () => {
  test("the admin list sends a signed-out visitor to sign in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { level: 1, name: "Sign in" })).toBeVisible();
  });

  test("the add-vehicle page is protected too", async ({ page }) => {
    await page.goto("/admin/vehicles/new");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("a wrong password shows one generic message", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("staff@example.com");
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("Incorrect email or password.");
    await expect(page.getByLabel("Email")).toHaveValue("staff@example.com");
  });

  test("staff pages are kept out of search engines", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("search engine information", () => {
  test("the sitemap lists the public pages and each car that is for sale", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const xml = await response.text();
    for (const path of PUBLIC_PAGES.filter((p) => !["/favorites", "/compare", "/login"].includes(p) && !p.startsWith("/cars/"))) {
      expect(xml, path).toContain(`<loc>${ORIGIN}${path}</loc>`);
    }
    expect(xml).toContain(CARS.bmwWhite.path);
    expect(xml).toContain(CARS.bmwBlack.path);
    expect(xml).not.toContain(CARS.sold.path);
  });

  test("robots.txt points to the sitemap and keeps staff pages out", async ({ request }) => {
    const text = await (await request.get("/robots.txt")).text();
    expect(text).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
    expect(text).toContain("Disallow: /admin");
    expect(text).toContain("Disallow: /login");
  });

  test("a vehicle page has its own title, canonical link and car structured data", async ({ page }) => {
    await page.goto(CARS.bmwWhite.path);
    await expect(page).toHaveTitle(/2024 BMW X5 xDrive40i for sale/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${ORIGIN}${CARS.bmwWhite.path}`,
    );
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    // The price is formatted with a non-breaking space ("XAF 68,500,000").
    expect(description).toMatch(/XAF\s68,500,000/);

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    const car = jsonLd.map((t) => JSON.parse(t)).find((d) => d["@type"] === "Car");
    expect(car).toBeTruthy();
    expect(car.sku).toBe(CARS.bmwWhite.reference);
    expect(car.offers.price).toBe(68_500_000);
    expect(car.offers.priceCurrency).toBe("XAF");
  });

  test("the home page has organisation structured data and social preview tags", async ({ page }) => {
    await page.goto("/");
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    const graph = jsonLd.map((t) => JSON.parse(t)).find((d) => d["@graph"])["@graph"];
    expect(graph.some((n: { "@type": unknown }) => JSON.stringify(n["@type"]).includes("AutoDealer"))).toBe(true);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Glorious Cars/);
  });
});
