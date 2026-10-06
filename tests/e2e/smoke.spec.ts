import { expect, test } from "@playwright/test";
import { PUBLIC_PAGES, expectNoSidewaysScroll, trackErrors } from "./support/helpers";

test.describe("every public page", () => {
  for (const path of PUBLIC_PAGES) {
    test(`${path} loads with a heading and no errors`, async ({ page }) => {
      const errors = trackErrors(page);
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.locator("h1").first(), path).toBeVisible();
      await expect(page).toHaveTitle(/\S/);
      await page.waitForLoadState("networkidle");
      // Photo optimisation requests from the local fake backend are expected to fail
      // in this environment; everything else must be clean.
      const real = errors.filter((e) => !e.includes("/_next/image") && !e.includes("status of 400") && !e.includes("status of 500"));
      expect(real, `console errors on ${path}`).toEqual([]);
    });
  }

  test("the site has one main landmark and a skip link", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toHaveCount(1);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  });
});

test.describe("error pages", () => {
  test("an unknown page shows the 404 message", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This page took a wrong turn" })).toBeVisible();
  });

  test("an unknown vehicle shows a friendly message, not a crash", async ({ page }) => {
    const response = await page.goto("/cars/bmw/x5-never-listed-2030-pc-xxx-0000");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "We couldn't find that vehicle" })).toBeVisible();
  });

  test("a sold vehicle is no longer public", async ({ page }) => {
    const response = await page.goto("/cars/audi/a4-2020-pc-aud-a4-0450");
    expect(response?.status()).toBe(404);
  });
});

test.describe("responses", () => {
  test("sends the security headers and hides the framework name", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("the web app manifest is served", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
  });
});

test.describe("layout on phones", () => {
  test("no public page scrolls sideways at phone width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of PUBLIC_PAGES) {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");
      await expectNoSidewaysScroll(page);
    }
  });
});
