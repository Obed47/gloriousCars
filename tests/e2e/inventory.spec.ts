import { expect, test } from "@playwright/test";
import { CARS, carCards, trackErrors } from "./support/helpers";

test.describe("finding a car", () => {
  test("the home quick search leads to matching results", async ({ page }) => {
    await page.goto("/");
    const search = page.getByRole("form", { name: "Quick vehicle search" });
    await search.getByLabel("Brand").selectOption("Toyota");
    await search.getByRole("button", { name: "Search Cars" }).click();
    await expect(page).toHaveURL(/\/cars\?brand=Toyota/);
    await expect(page.getByRole("status")).toHaveText(/1 of 5 vehicles/);
    await expect(carCards(page)).toHaveCount(1);
  });

  test("the inventory lists every car for sale and hides the sold one", async ({ page }) => {
    await page.goto("/cars");
    await expect(page.getByRole("status")).toHaveText(/5 vehicles available/);
    await expect(page.getByText(CARS.sold.title)).toHaveCount(0);
  });

  test("a search with several words needs them all to match", async ({ page }) => {
    await page.goto("/cars?search=bmw%20petrol");
    await expect(carCards(page)).toHaveCount(2);
  });

  test("searching for transmission finds automatic cars", async ({ page }) => {
    // Regression: the navbar's "Automatic" quick link used to find nothing.
    await page.goto("/cars?search=automatic");
    await expect(carCards(page)).toHaveCount(4);
  });

  test("the navbar quick links open a working filter", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search vehicles" }).click();
    const dialog = page.getByRole("dialog", { name: "Search vehicles" });
    await dialog.getByRole("button", { name: "Automatic" }).click();
    await expect(page).toHaveURL(/\/cars\?transmission=Automatic/);
    await expect(carCards(page)).toHaveCount(4);
  });

  test("ticking a brand in the filters updates the URL and the count", async ({ page, isMobile }) => {
    await page.goto("/cars");
    // Wide screens show the filters in the sidebar; phones keep them in a sheet.
    let filters = page.locator("aside");
    if (isMobile) {
      await page.getByRole("button", { name: /^Filter/ }).click();
      filters = page.getByRole("dialog", { name: "Filter and sort" });
    }
    await filters.getByRole("checkbox", { name: "Toyota" }).check();
    await expect(page).toHaveURL(/brand=Toyota/);
    await expect(page.getByRole("status")).toHaveText(/1 of 5 vehicles/);
  });

  test("sorting by price puts the cheapest car first", async ({ page }) => {
    await page.goto("/cars");
    await page.getByRole("combobox", { name: "Sort vehicles" }).selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);
    await expect(carCards(page).first().getByRole("heading", { level: 3 })).toHaveText(/Volkswagen Golf/);
  });

  test("a search with no results explains it and can be reset", async ({ page }) => {
    await page.goto("/cars?search=lamborghini");
    await expect(page.getByText("No vehicles match your search")).toBeVisible();
    await page.getByRole("button", { name: "Reset filters" }).click();
    await expect(page.getByRole("status")).toHaveText(/5 vehicles available/);
  });

  test("the mobile filter sheet opens, closes with Escape and returns focus", async ({ page, isMobile }) => {
    test.skip(!isMobile, "filter sheet is for phones");
    await page.goto("/cars");
    const trigger = page.getByRole("button", { name: /^Filter/ });
    await trigger.click();
    const sheet = page.getByRole("dialog", { name: "Filter and sort" });
    await expect(sheet).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

test.describe("a vehicle page", () => {
  test("shows the car, its reference, price and WhatsApp enquiry", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto(CARS.bmwWhite.path);
    await expect(page.getByRole("heading", { level: 1, name: CARS.bmwWhite.title })).toBeVisible();
    await expect(page.getByText(`Reference ${CARS.bmwWhite.reference}`)).toBeVisible();
    await expect(page.getByText("XAF 68,500,000").first()).toBeVisible();

    const enquiry = page.getByRole("link", { name: "Order / Inquire on WhatsApp" });
    await expect(enquiry.first()).toHaveAttribute("href", new RegExp(`^https://wa\\.me/237677176139\\?text=`));
    const message = decodeURIComponent((await enquiry.first().getAttribute("href"))!.split("text=")[1]);
    expect(message).toContain(`Reference: ${CARS.bmwWhite.reference}`);
    expect(errors.filter((e) => !e.includes("/_next/image") && !e.includes("status of 4") && !e.includes("status of 5"))).toEqual([]);
  });

  test("two identical cars in stock each have their own page", async ({ page }) => {
    // Regression: both units shared one URL, so the second could not be opened.
    await page.goto(CARS.bmwBlack.path);
    await expect(page.getByText(`Reference ${CARS.bmwBlack.reference}`)).toBeVisible();
    await page.goto(CARS.bmwWhite.path);
    await expect(page.getByText(`Reference ${CARS.bmwWhite.reference}`)).toBeVisible();
  });

  test("shows a breadcrumb back to the inventory", async ({ page }) => {
    await page.goto(CARS.rav4.path);
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await crumbs.getByRole("link", { name: "Cars" }).click();
    await expect(page).toHaveURL(/\/cars$/);
  });

  test("suggests similar vehicles", async ({ page }) => {
    await page.goto(CARS.bmwWhite.path);
    await expect(page.getByRole("heading", { name: "Similar vehicles" })).toBeVisible();
  });

  test("the gallery steps through photos", async ({ page }) => {
    await page.goto(CARS.bmwWhite.path);
    await expect(page.getByText("1 / 2")).toBeVisible();
    await page.getByRole("button", { name: "Next image" }).first().click();
    await expect(page.getByText("2 / 2")).toBeVisible();
  });
});
