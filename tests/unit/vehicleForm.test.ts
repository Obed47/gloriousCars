/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  draftFromFormData,
  draftFromVehicle,
  emptyDraft,
  validateDraft,
  type VehicleDraft,
} from "@/lib/admin/vehicleForm";
import { makeVehicle, photo, toVehicleInput } from "../fixtures/vehicles";

/** A draft that passes validation; tests override one field at a time. */
function validDraft(overrides: Partial<VehicleDraft> = {}): VehicleDraft {
  return {
    ...emptyDraft(),
    reference: "PC-TEST-0001",
    name: "Toyota Corolla",
    year: "2022",
    price: "12500000",
    color: "White",
    location: "Douala — Akwa Showroom",
    description: "Clean car.",
    images: [{ url: photo("corolla"), alt: "", angle: "Front" }],
    ...overrides,
  };
}

function expectErrors(d: VehicleDraft, keys: string[]) {
  const result = validateDraft(d);
  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(Object.keys(result.errors).sort()).toEqual([...keys].sort());
}

describe("validateDraft: required fields", () => {
  it("accepts a complete draft", () => {
    const result = validateDraft(validDraft());
    expect(result.ok).toBe(true);
  });

  it("reports every missing required field at once", () => {
    expectErrors(emptyDraft(), ["reference", "name", "color", "location", "description", "price"]);
  });

  it("treats whitespace-only text as missing", () => {
    expectErrors(validDraft({ name: "   " }), ["name"]);
  });
});

describe("validateDraft: numbers", () => {
  it("accepts price typed with spaces or commas", () => {
    const result = validateDraft(validDraft({ price: "12 500,000" }));
    expect(result.ok && result.value.price).toBe(12_500_000);
  });

  it("rejects a non-numeric price", () => {
    expectErrors(validDraft({ price: "twelve million" }), ["price"]);
  });

  it("rejects an empty price", () => {
    expectErrors(validDraft({ price: "" }), ["price"]);
  });

  it("rejects a negative price", () => {
    expectErrors(validDraft({ price: "-5" }), ["price"]);
  });

  it("accepts a price of zero", () => {
    expect(validateDraft(validDraft({ price: "0" })).ok).toBe(true);
  });

  it("requires whole numbers for year, mileage, seats and doors", () => {
    expectErrors(
      validDraft({ year: "2022.5", mileage: "1.2", seats: "5.0", doors: "" }),
      ["year", "mileage", "seats", "doors"],
    );
  });

  it("keeps the year inside the database's 1900–2100 range", () => {
    expectErrors(validDraft({ year: "1899" }), ["year"]);
    expectErrors(validDraft({ year: "2101" }), ["year"]);
    expect(validateDraft(validDraft({ year: "1900" })).ok).toBe(true);
    expect(validateDraft(validDraft({ year: "2100" })).ok).toBe(true);
  });

  it("requires at least one seat and one door", () => {
    expectErrors(validDraft({ seats: "0", doors: "0" }), ["seats", "doors"]);
  });
});

describe("validateDraft: choice fields", () => {
  it("rejects a fuel type the database does not allow", () => {
    expectErrors(validDraft({ fuelType: "Hydrogen" }), ["fuelType"]);
  });

  it("rejects an unknown status", () => {
    expectErrors(validDraft({ status: "Pending" }), ["status"]);
  });

  it("accepts every status the public site understands", () => {
    for (const status of ["Available", "Reserved", "Sold"]) {
      expect(validateDraft(validDraft({ status })).ok).toBe(true);
    }
  });
});

describe("validateDraft: car name and make", () => {
  it("takes the make from the start of the name", () => {
    const result = validateDraft(validDraft({ name: "  Land Rover Defender 110 " }));
    expect(result.ok && result.value.name).toBe("Land Rover Defender 110");
    expect(result.ok && result.value.brand).toBe("Land Rover");
  });

  it("uses the first word as the make when it is not in the brand list", () => {
    const result = validateDraft(validDraft({ name: "Dacia Duster" }));
    expect(result.ok && result.value.brand).toBe("Dacia");
  });
});

describe("validateDraft: photos", () => {
  it("refuses a photo link from another website", () => {
    const result = validateDraft(
      validDraft({ images: [{ url: "https://images.example.com/x.jpg", alt: "", angle: "Front" }] }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.images).toContain("images.example.com");
  });

  it("ignores blank photo rows", () => {
    const result = validateDraft(
      validDraft({
        images: [
          { url: "", alt: "", angle: "Front" },
          { url: photo("corolla"), alt: "", angle: "Rear" },
        ],
      }),
    );
    expect(result.ok && result.value.images).toHaveLength(1);
  });

  it("falls back to the car name as alt text", () => {
    const result = validateDraft(validDraft());
    expect(result.ok && result.value.images[0].alt).toBe("Toyota Corolla");
  });

  it("falls back to 'Exterior' for an angle it does not recognise", () => {
    const result = validateDraft(
      validDraft({ images: [{ url: photo("corolla"), alt: "x", angle: "Roof" }] }),
    );
    expect(result.ok && result.value.images[0].angle).toBe("Exterior");
  });
});

describe("validateDraft: normalisation", () => {
  it("always stores the currency as XAF", () => {
    const result = validateDraft(validDraft());
    expect(result.ok && result.value.currency).toBe("XAF");
  });
});

describe("edit round trip", () => {
  it("an unchanged existing vehicle validates back to the same data", () => {
    // Editing a car and saving without changes must not alter it.
    const vehicle = makeVehicle();
    const result = validateDraft(draftFromVehicle(vehicle));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual(toVehicleInput(vehicle));
  });
});

describe("draftFromFormData", () => {
  it("reads the fields the form submits", () => {
    const fd = new FormData();
    fd.set("reference", "  PC-1  ");
    fd.set("name", "Audi A4");
    fd.set("featured", "on");
    const draft = draftFromFormData(fd);
    expect(draft.reference).toBe("PC-1");
    expect(draft.name).toBe("Audi A4");
    expect(draft.featured).toBe(true);
  });

  it("treats an unticked featured box as false", () => {
    expect(draftFromFormData(new FormData()).featured).toBe(false);
  });

  it("pairs each photo URL with its alt text and angle by position", () => {
    const fd = new FormData();
    fd.append("image_url", photo("a"));
    fd.append("image_alt", "Front view");
    fd.append("image_angle", "Front");
    fd.append("image_url", photo("b"));
    fd.append("image_alt", "");
    fd.append("image_angle", "Rear");
    expect(draftFromFormData(fd).images).toEqual([
      { url: photo("a"), alt: "Front view", angle: "Front" },
      { url: photo("b"), alt: "", angle: "Rear" },
    ]);
  });
});
