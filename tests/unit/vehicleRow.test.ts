/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { rowToVehicle, vehicleToRow } from "@/lib/supabase/vehicles";
import { makeVehicle, makeVehicleRow, toVehicleInput } from "../fixtures/vehicles";

describe("rowToVehicle", () => {
  it("maps snake_case columns to the camelCase model", () => {
    const v = rowToVehicle(makeVehicleRow());
    expect(v.name).toBe("BMW X5 xDrive40i");
    expect(v.brand).toBe("BMW");
    expect(v.fuelType).toBe("Petrol");
    expect(v.listedAt).toBe("2026-09-01T10:00:00.000Z");
  });

  it("converts numeric prices that arrive as strings", () => {
    // Postgres `numeric` columns come back as strings through PostgREST.
    expect(rowToVehicle(makeVehicleRow({ price: "68500000" })).price).toBe(68_500_000);
    expect(rowToVehicle(makeVehicleRow({ price: 1200 })).price).toBe(1200);
  });

  it("defaults a missing image list to an empty array", () => {
    const v = rowToVehicle(makeVehicleRow({ images: null as unknown as [] }));
    expect(v.images).toEqual([]);
  });

  it("normalises the listing date to ISO 8601", () => {
    expect(rowToVehicle(makeVehicleRow({ listed_at: "2026-09-01T12:00:00+02:00" })).listedAt).toBe(
      "2026-09-01T10:00:00.000Z",
    );
  });
});

describe("vehicleToRow", () => {
  it("writes the name and brand the admin derived", () => {
    const row = vehicleToRow(toVehicleInput(makeVehicle()));
    expect(row.name).toBe("BMW X5 xDrive40i");
    expect(row.brand).toBe("BMW");
  });

  it("omits the generated id and listing date so the database assigns them", () => {
    const row = vehicleToRow(toVehicleInput(makeVehicle()));
    expect(row).not.toHaveProperty("id");
    expect(row).not.toHaveProperty("listed_at");
  });

  it("round-trips through rowToVehicle without losing data", () => {
    const original = makeVehicle();
    const row = { ...vehicleToRow(toVehicleInput(original)), id: original.id, listed_at: original.listedAt };
    expect(rowToVehicle(row as never)).toEqual(original);
  });
});
