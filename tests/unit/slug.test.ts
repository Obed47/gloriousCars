/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  brandSlug,
  slugify,
  vehicleFullTitle,
  vehiclePath,
  vehicleSlug,
  vehicleTitle,
} from "@/lib/slug";
import { makeVehicle } from "../fixtures/vehicles";

describe("slugify", () => {
  it("lowercases and joins words with hyphens", () => {
    expect(slugify("BMW X5 xDrive40i 2024")).toBe("bmw-x5-xdrive40i-2024");
  });

  it("folds accents so the slug is plain ASCII", () => {
    expect(slugify("Yaoundé")).toBe("yaounde");
    expect(slugify("Bonabéri Lot")).toBe("bonaberi-lot");
  });

  it("trims leading and trailing separators and collapses runs", () => {
    expect(slugify("  --Hello!!  ")).toBe("hello");
    expect(slugify("Mercedes  -  Benz")).toBe("mercedes-benz");
  });

  it("returns an empty string for input with no letters or digits", () => {
    expect(slugify("—  ")).toBe("");
  });
});

describe("brand and vehicle slugs", () => {
  it("builds a brand slug", () => {
    expect(brandSlug({ brand: "Land Rover" })).toBe("land-rover");
  });

  it("omits a missing trim without leaving a double hyphen", () => {
    const v = makeVehicle({
      model: "Golf",
      trim: undefined,
      year: 2019,
      reference: "PC-VW-GOLF-0007",
    });
    expect(vehicleSlug(v)).toBe("golf-2019-pc-vw-golf-0007");
  });

  it("builds readable titles", () => {
    const v = makeVehicle();
    expect(vehicleTitle(v)).toBe("BMW X5 xDrive40i");
    expect(vehicleFullTitle(v)).toBe("2024 BMW X5 xDrive40i");
  });
});

describe("vehiclePath", () => {
  it("builds a clean, readable detail URL that includes the stock reference", () => {
    const v = makeVehicle({ reference: "PC-BMW-X5-0241" });
    expect(vehiclePath(v)).toBe("/cars/bmw/x5-xdrive40i-2024-pc-bmw-x5-0241");
  });

  it("gives two identical cars in stock different URLs", () => {
    // Dealers often hold several units of the same model, trim and year.
    // Without the reference in the slug, the second one could never be opened.
    const first = makeVehicle({ id: "v-a", reference: "PC-BMW-X5-0241" });
    const second = makeVehicle({ id: "v-b", reference: "PC-BMW-X5-0242" });
    expect(vehiclePath(first)).not.toBe(vehiclePath(second));
  });
});
