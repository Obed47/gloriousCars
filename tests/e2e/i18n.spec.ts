import { expect, test } from "@playwright/test";
import { E2E_PORT } from "../../scripts/e2e-env.mjs";
import { LOCALE_COOKIE } from "../../src/i18n/locales";
import { CARS, trackErrors } from "./support/helpers";

const ORIGIN = `http://localhost:${E2E_PORT}`;

/** The primary header nav. Holds the language switcher, but its link list is
 *  hidden below the `lg` breakpoint, so it isn't used for text assertions. */
function primaryNav(page: import("@playwright/test").Page) {
  return page.getByRole("navigation", { name: /^(Primary|Principale)$/ });
}

/** The footer nav: always rendered regardless of viewport, so link-name
 *  assertions here work on both the desktop and mobile Playwright projects. */
function footerNav(page: import("@playwright/test").Page) {
  return page.getByRole("navigation", { name: /^(Footer navigation|Navigation du pied de page)$/ });
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

/** Every root-relative `<a href>` in a server-rendered page, with its tag. */
function internalAnchors(html: string): { href: string; tag: string }[] {
  return [...html.matchAll(/<a\b[^>]*>/g)]
    .map((m) => ({ tag: m[0], href: /\shref="([^"]*)"/.exec(m[0])?.[1] ?? "" }))
    .filter(({ href }) => href.startsWith("/") && !href.startsWith("//"));
}

test.describe("French pages link to French pages (no cookie, as a crawler sees them)", () => {
  for (const path of ["/fr", "/fr/cars", "/fr/about", `/fr${CARS.bmwWhite.path}`]) {
    test(`every internal link on ${path} stays on the French site`, async ({ playwright }) => {
      // A fresh request context: no NEXT_LOCALE cookie, like a search crawler.
      const request = await playwright.request.newContext({ baseURL: ORIGIN });
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(200);
      const anchors = internalAnchors(await response.text());
      // The language switcher (header + footer) is the only way back to English.
      const switchers = anchors.filter(({ tag }) => /title="Passer à l/.test(tag));
      expect(switchers.length).toBe(2);
      const rest = anchors.filter((a) => !switchers.includes(a));
      expect(rest.length).toBeGreaterThan(5);
      const english = rest.map((a) => a.href).filter((href) => !/^\/fr(\/|\?|#|$)/.test(href));
      expect(english, `English links on ${path}`).toEqual([]);
      await request.dispose();
    });
  }

  test("the vehicle page's breadcrumb and brand filter link point at /fr", async ({ playwright }) => {
    const request = await playwright.request.newContext({ baseURL: ORIGIN });
    const html = await (await request.get(`/fr${CARS.bmwWhite.path}`)).text();
    const hrefs = internalAnchors(html).map((a) => a.href);
    expect(hrefs).toContain("/fr/cars?brand=BMW");
    await request.dispose();
  });
});

test.describe("server and client agree on the current path", () => {
  for (const path of ["/cars", "/fr/cars", "/fr", CARS.bmwWhite.path, `/fr${CARS.bmwWhite.path}`]) {
    test(`${path} hydrates without a mismatch`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(errors.filter((e) => /hydrat|#418|#423|#425/i.test(e))).toEqual([]);
    });
  }

  test("the Cars nav link is marked current on /cars and /fr/cars", async ({ page }) => {
    await page.goto("/cars");
    await expect(page.locator('nav[aria-label="Primary"] a[aria-current="page"]')).toHaveAttribute("href", "/cars");
    await page.goto("/fr/cars");
    await expect(page.locator('nav[aria-label="Principale"] a[aria-current="page"]')).toHaveAttribute("href", "/fr/cars");
  });

  test("the server-rendered language switcher on /cars targets /fr/cars, never /fr/en/…", async ({ request }) => {
    const html = await (await request.get("/cars")).text();
    expect(html).toContain('href="/fr/cars"');
    expect(html).not.toContain("/fr/en");
  });

  test("the French home page uses the hero header style", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.locator("header").first()).toHaveClass(/bg-ink/);
  });

  test("on a French vehicle page the WhatsApp bubble is raised clear of the action bar", async ({ page }) => {
    await page.goto(`/fr${CARS.bmwWhite.path}`);
    await expect(page.getByRole("link", { name: "Discuter avec nous sur WhatsApp" })).toHaveClass(/bottom-24/);
  });

  test("the footer and navbar landmarks are translated on French pages", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.getByRole("navigation", { name: "Principale" })).toBeAttached();
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("navigation", { name: "Navigation du pied de page" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Politique de confidentialité" })).toHaveAttribute("href", "/fr/privacy");
    await expect(footer.getByText("Tous droits réservés.", { exact: false })).toBeVisible();
    await expect(footer.getByText("Chat on WhatsApp")).toHaveCount(0);
  });

  test("the skip link is translated on French pages", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.getByRole("link", { name: "Aller au contenu" })).toHaveAttribute("href", "#main");
  });
});

test.describe("only real locales reach the [lang] segment", () => {
  // These skip the proxy (its matcher ignores file-like paths), so they used to
  // land in `[lang]` as the "locale" and render the home page with a 200.
  for (const path of ["/apple-touch-icon.png", "/wp-config.txt", "/foo.js", "/this-is-not-a-locale-or-page"]) {
    test(`${path} is a 404`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(404);
      expect(await response.text()).not.toContain('id="home-hero"');
    });
  }

  test("/this-is-not-a-locale-or-page shows the site 404 page", async ({ page }) => {
    const response = await page.goto("/this-is-not-a-locale-or-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This page took a wrong turn" })).toBeVisible();
  });

  test("stray /en paths still redirect to the unprefixed url", async ({ request }) => {
    for (const [from, to] of [["/en", "/"], ["/en/about", "/about"]]) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), from).toBeGreaterThanOrEqual(300);
      expect(response.status(), from).toBeLessThan(400);
      expect(new URL(response.headers()["location"], ORIGIN).pathname, from).toBe(to);
    }
  });
});
