/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { rowToVehicle, vehicleToRow } from "@/lib/supabase/vehicles";
import { makeVehicle, makeVehicleRow } from "../fixtures/vehicles";

describe("rowToVehicle", () => {
  it("maps snake_case columns to the camelCase model", () => {
    const v = rowToVehicle(makeVehicleRow());
    expect(v.fuelType).toBe("Petrol");
    expect(v.driveType).toBe("AWD");
    expect(v.bodyType).toBe("SUV");
    expect(v.listedAt).toBe("2026-09-01T10:00:00.000Z");
  });

  it("converts numeric prices that arrive as strings", () => {
    // Postgres `numeric` columns come back as strings through PostgREST.
    expect(rowToVehicle(makeVehicleRow({ price: "68500000" })).price).toBe(68_500_000);
    expect(rowToVehicle(makeVehicleRow({ price: 1200 })).price).toBe(1200);
  });

  it("turns a null trim into an absent one", () => {
    expect(rowToVehicle(makeVehicleRow({ trim: null })).trim).toBeUndefined();
  });

  it("defaults missing JSON lists to empty arrays", () => {
    const v = rowToVehicle(
      makeVehicleRow({
        highlights: null as unknown as string[],
        features: null as unknown as [],
        images: null as unknown as [],
      }),
    );
    expect(v.highlights).toEqual([]);
    expect(v.features).toEqual([]);
    expect(v.images).toEqual([]);
  });

  it("normalises the listing date to ISO 8601", () => {
    expect(rowToVehicle(makeVehicleRow({ listed_at: "2026-09-01T12:00:00+02:00" })).listedAt).toBe(
      "2026-09-01T10:00:00.000Z",
    );
  });
});

describe("vehicleToRow", () => {
  it("writes a missing trim as null", () => {
    const row = vehicleToRow({ ...stripGenerated(makeVehicle()), trim: undefined });
    expect(row.trim).toBeNull();
  });

  it("omits the generated id and listing date so the database assigns them", () => {
    const row = vehicleToRow(stripGenerated(makeVehicle()));
    expect(row).not.toHaveProperty("id");
    expect(row).not.toHaveProperty("listed_at");
  });

  it("round-trips through rowToVehicle without losing data", () => {
    const original = makeVehicle();
    const row = { ...vehicleToRow(stripGenerated(original)), id: original.id, listed_at: original.listedAt };
    expect(rowToVehicle(row as never)).toEqual(original);
  });
});

function stripGenerated(v: ReturnType<typeof makeVehicle>) {
  const { id: _id, listedAt: _listedAt, ...input } = v;
  return input;
}
