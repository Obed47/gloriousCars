import { expect, test } from "@playwright/test";
import { CARS, WHATSAPP_NUMBER, carCards, trackErrors, whatsappText } from "./support/helpers";

test.describe("favourites", () => {
  test("a saved car stays saved after a reload and shows in the navbar", async ({ page }) => {
    await page.goto("/cars?brand=BMW");
    await carCards(page).first().getByRole("button", { name: /Save .* to favorites/ }).click();
    await expect(page.getByRole("link", { name: "Favorites (1)" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("link", { name: "Favorites (1)" })).toBeVisible();

    await page.goto("/favorites");
    await expect(page.getByRole("heading", { level: 1, name: "My favorites" })).toBeVisible();
    await expect(page.getByText("1 saved vehicle")).toBeVisible();
  });

  test("the saved heart on a vehicle page toggles", async ({ page }) => {
    await page.goto(CARS.rav4.path);
    const save = page.getByRole("button", { name: "Save", exact: true });
    await save.click();
    await expect(page.getByRole("button", { name: "Saved" })).toHaveAttribute("aria-pressed", "true");
  });

  test("a corrupt saved list does not break the site", async ({ page }) => {
    // Regression: a non-list value in storage crashed every page.
    const errors = trackErrors(page);
    await page.addInitScript(() => localStorage.setItem("glorious-cars:favorites", '{"corrupt":true}'));
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Favorites" })).toBeVisible();
    expect(errors.filter((e) => !e.includes("/_next/image") && !e.includes("status of"))).toEqual([]);
  });

  test("a saved car that is no longer for sale is not counted", async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem("glorious-cars:favorites", JSON.stringify(["v-bmw-x5-xdrive40i-2024-a1", "v-was-sold-away"])),
    );
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Favorites (1)" })).toBeVisible();
  });
});

test.describe("comparison", () => {
  test("two cars compare side by side, with the better value marked", async ({ page }) => {
    await page.goto("/cars");
    await page.getByRole("button", { name: "Add BMW X5 xDrive40i to comparison" }).first().click();
    await page.getByRole("button", { name: "Add Toyota RAV4 Hybrid to comparison" }).click();

    // The "2 of 3 selected" count is hidden on phones, so check the picked cars instead.
    const tray = page.getByRole("region", { name: "Vehicle comparison tray" });
    await expect(tray.getByRole("button", { name: /^Remove .* from comparison$/ })).toHaveCount(2);
    await tray.getByRole("link", { name: "Compare" }).click();

    await expect(page).toHaveURL(/\/compare$/);
    await expect(page.getByText("Comparing 2 of 3")).toBeVisible();
    const priceRow = page.getByRole("row").filter({ has: page.getByRole("rowheader", { name: "Price" }) });
    await expect(priceRow.getByText("Best")).toBeVisible();
  });

  test("a compare pick for a car that is gone does not block the others", async ({ page }) => {
    // Regression: a stale pick occupied a slot, so the compare buttons said "full"
    // while the tray showing them was hidden.
    await page.addInitScript(() =>
      localStorage.setItem("glorious-cars:compare", JSON.stringify(["v-was-sold-away", "v-toyota-rav4-hybrid-2023-c3"])),
    );
    await page.goto("/cars");
    const tray = page.getByRole("region", { name: "Vehicle comparison tray" });
    await expect(tray.getByRole("button", { name: "Remove Toyota RAV4 Hybrid from comparison" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add BMW X5 xDrive40i to comparison" }).first()).toBeEnabled();
  });

  test("the compare page explains what to do when nothing is picked", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByText("Nothing to compare yet")).toBeVisible();
  });
});

test.describe("test drive booking", () => {
  test("a visitor can request a test drive, which opens WhatsApp", async ({ page }) => {
    await page.goto(CARS.rav4.path);
    await page.getByRole("button", { name: "Book a Test Drive" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Book your test drive" });
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Confirm Test Drive" }).click();
    await expect(dialog.getByText("Please enter your name.")).toBeVisible();

    await dialog.getByLabel(/Full name/).fill("Amina Bello");
    await dialog.getByLabel(/Phone number/).fill("+237 600 000 000");
    const tomorrow = new Date(Date.now() + 86_400_000);
    const pad = (n: number) => String(n).padStart(2, "0");
    await dialog.getByLabel(/Preferred date/).fill(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`);
    await dialog.getByRole("button", { name: "10:00" }).click();

    const popupPromise = page.waitForEvent("popup");
    await dialog.getByRole("button", { name: "Confirm Test Drive" }).click();
    const popup = await popupPromise;
    expect(popup.url()).toContain(WHATSAPP_NUMBER);
    expect(whatsappText(popup.url())).toContain("Name: Amina Bello");
    // The dialog's name comes from its heading, which now reads "Your test drive is requested".
    await expect(page.getByRole("dialog").getByText("Your test drive is requested")).toBeVisible();
    await popup.close();
  });

  test("keyboard focus stays inside the booking dialog and returns when it closes", async ({ page }) => {
    await page.goto(CARS.rav4.path);
    const opener = page.getByRole("button", { name: "Book a Test Drive" }).first();
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Book your test drive" });
    await expect(dialog).toBeVisible();

    for (let i = 0; i < 30; i += 1) {
      await page.keyboard.press("Tab");
      const inside = await dialog.evaluate((el) => el.contains(document.activeElement));
      expect(inside, `focus escaped the dialog on tab ${i}`).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
});

test.describe("contact", () => {
  test("the contact form hands the enquiry to WhatsApp", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("textbox", { name: "Name" }).fill("Amina");
    await page.getByRole("textbox", { name: "Email" }).fill("amina@example.com");
    await page.getByRole("textbox", { name: "Message" }).fill("Is the RAV4 still available?");
    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: /Send via WhatsApp/ }).click();
    const popup = await popupPromise;
    const text = whatsappText(popup.url());
    expect(text).toContain("Subject: General enquiry");
    expect(text).toContain("Is the RAV4 still available?");
    await expect(page.getByText("We've opened WhatsApp for you")).toBeVisible();
    await popup.close();
  });
});
