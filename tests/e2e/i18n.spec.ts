import { expect, test } from "@playwright/test";
import { E2E_PORT } from "../../scripts/e2e-env.mjs";
import { LOCALE_COOKIE } from "../../src/i18n/locales";

const ORIGIN = `http://localhost:${E2E_PORT}`;

/** The primary header nav. Holds the language switcher, but its link list is
 *  hidden below the `lg` breakpoint, so it isn't used for text assertions. */
function primaryNav(page: import("@playwright/test").Page) {
  return page.getByRole("navigation", { name: "Primary" });
}

/** The footer nav: always rendered regardless of viewport, so link-name
 *  assertions here work on both the desktop and mobile Playwright projects. */
function footerNav(page: import("@playwright/test").Page) {
  return page.getByRole("navigation", { name: "Footer navigation" });
}

test.describe("locale detection", () => {
  test("a French Accept-Language header redirects / to /fr and renders French nav", async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: "fr-FR" });
    const page = await context.newPage();
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(`${ORIGIN}/fr`);
    await expect(
      footerNav(page).getByRole("link", { name: "Véhicules", exact: true }),
    ).toBeVisible();
    await context.close();
  });

  test("no special header keeps / at / and renders English nav (regression guard)", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(`${ORIGIN}/`);
    await expect(
      footerNav(page).getByRole("link", { name: "Cars", exact: true }),
    ).toBeVisible();
  });
});

test.describe("manual language switcher", () => {
  test("switching on an English page navigates to /fr and the choice persists via cookie", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await expect(
      footerNav(page).getByRole("link", { name: "Cars", exact: true }),
    ).toBeVisible();

    // The header switcher shows a compact "FR"/"EN" code below the `sm`
    // breakpoint (to avoid overflowing the icon row on phones) and the full
    // "Français"/"English" word above it, so its accessible name differs by
    // viewport — match on the `title` attribute instead, which is constant.
    await primaryNav(page).getByTitle("Switch to French").click();
    await expect(page).toHaveURL(`${ORIGIN}/fr`);
    await expect(
      footerNav(page).getByRole("link", { name: "Véhicules", exact: true }),
    ).toBeVisible();

    const cookies = await context.cookies();
    const localeCookie = cookies.find((c) => c.name === LOCALE_COOKIE);
    expect(localeCookie?.value).toBe("fr");

    // A later navigation to the unprefixed site should still land on /fr,
    // proving persistence comes from the cookie, not just client router state.
    await page.goto("/");
    await expect(page).toHaveURL(`${ORIGIN}/fr`);
    await expect(
      footerNav(page).getByRole("link", { name: "Véhicules", exact: true }),
    ).toBeVisible();
  });
});

test.describe("French 404s", () => {
  test("a nonexistent vehicle under /fr renders the French vehicle not-found page", async ({
    page,
  }) => {
    const response = await page.goto(
      "/fr/cars/bmw/x5-never-listed-2030-pc-xxx-0000",
    );
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Nous n'avons pas trouvé ce véhicule" }),
    ).toBeVisible();
  });
});

test.describe("English prefix redirect", () => {
  test("/en/cars redirects to /cars", async ({ page }) => {
    const response = await page.goto("/en/cars");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(`${ORIGIN}/cars`);
  });
});
