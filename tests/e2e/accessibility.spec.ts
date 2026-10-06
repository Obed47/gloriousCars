import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { CARS, PUBLIC_PAGES } from "./support/helpers";

/**
 * Automated WCAG 2.1 AA scan of every public page. Serious and critical
 * problems fail the test; minor ones are reported in the test output.
 */
test.describe("accessibility (WCAG 2.1 AA)", () => {
  test.skip(({ isMobile }) => isMobile, "run once, on desktop");

  for (const path of [...PUBLIC_PAGES, CARS.rav4.path]) {
    test(`${path} has no serious accessibility problems`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      const summary = blocking.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length} element${v.nodes.length === 1 ? "" : "s"})`);
      expect(summary, `blocking accessibility problems on ${path}`).toEqual([]);
    });
  }

  test("forms have labels for every field", async ({ page }) => {
    await page.goto("/contact");
    const unlabelled = await page.evaluate(() =>
      Array.from(document.querySelectorAll("input, select, textarea"))
        .filter((el) => (el as HTMLInputElement).type !== "hidden")
        .filter((el) => !el.getAttribute("aria-label") && !(el.id && document.querySelector(`label[for="${el.id}"]`)) && !el.closest("label"))
        .map((el) => el.outerHTML.slice(0, 80)),
    );
    expect(unlabelled).toEqual([]);
  });
});
