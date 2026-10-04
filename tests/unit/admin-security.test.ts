/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { photo } from "../fixtures/vehicles";

/**
 * Security-critical paths: every admin write must pass the staff check before
 * it touches the database, and invalid input must never be written.
 */

const REDIRECT = "NEXT_REDIRECT";

const db = {
  // Calls made against `public.vehicles` by the server actions.
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  select: vi.fn(),
  storageRemove: vi.fn(),
  // Rows returned by select()/update()/delete() for the test.
  affected: [{ id: "v-1" }] as { id: string }[],
  existingImages: [] as { url: string }[],
  error: null as null | { code?: string; message: string },
};

vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`${REDIRECT};${to}`);
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const staff = { current: null as null | { id: string; email: string; role: "admin" | "editor" } };
vi.mock("@/lib/auth", () => ({
  requireStaff: async () => {
    if (!staff.current) throw new Error(`${REDIRECT};/login`);
    return staff.current;
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    from: (table: string) => {
      expect(table).toBe("vehicles");
      return {
        select: (cols: string) => {
          db.select(cols);
          return {
            eq: () => ({
              maybeSingle: async () => ({ data: { images: db.existingImages } }),
            }),
          };
        },
        insert: async (row: unknown) => {
          db.insert(row);
          return { error: db.error };
        },
        update: (row: unknown) => {
          db.update(row);
          return {
            eq: () => ({
              select: async () => ({ data: db.error ? null : db.affected, error: db.error }),
            }),
          };
        },
        delete: () => ({
          eq: () => ({
            select: async () => {
              db.delete();
              return { data: db.affected, error: db.error };
            },
          }),
        }),
      };
    },
    storage: {
      from: () => ({
        remove: async (paths: string[]) => {
          db.storageRemove(paths);
          return { error: null };
        },
      }),
    },
  }),
}));

const actions = () => import("@/app/admin/actions");

function validForm(extra: Record<string, string | string[]> = {}) {
  const fd = new FormData();
  const set: Record<string, string> = {
    reference: "PC-TOY-0001",
    brand: "Toyota",
    model: "Corolla",
    year: "2022",
    price: "12500000",
    mileage: "1000",
    fuelType: "Petrol",
    transmission: "Automatic",
    engine: "1.8L",
    horsepower: "130",
    driveType: "FWD",
    bodyType: "Sedan",
    color: "White",
    seats: "5",
    doors: "4",
    condition: "Used",
    status: "Available",
    location: "Douala — Akwa Showroom",
    description: "Clean car.",
    ...Object.fromEntries(Object.entries(extra).filter(([, v]) => typeof v === "string")),
  };
  for (const [k, v] of Object.entries(set)) fd.set(k, v);
  fd.append("image_url", photo("corolla"));
  fd.append("image_alt", "");
  fd.append("image_angle", "Front");
  return fd;
}

beforeEach(() => {
  staff.current = null;
  db.insert.mockReset();
  db.update.mockReset();
  db.delete.mockReset();
  db.select.mockReset();
  db.storageRemove.mockReset();
  db.affected = [{ id: "v-1" }];
  db.existingImages = [];
  db.error = null;
});

describe("saveVehicle: authorisation", () => {
  it("writes nothing and redirects a signed-out visitor to login", async () => {
    const { saveVehicle } = await actions();
    await expect(saveVehicle(null, emptyState(), validForm())).rejects.toThrow(`${REDIRECT};/login`);
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it("writes nothing when an update is attempted without staff rights", async () => {
    const { saveVehicle } = await actions();
    await expect(saveVehicle("v-1", emptyState(), validForm())).rejects.toThrow(REDIRECT);
    expect(db.update).not.toHaveBeenCalled();
    expect(db.storageRemove).not.toHaveBeenCalled();
  });
});

describe("saveVehicle: validation", () => {
  it("returns field errors and writes nothing for an invalid draft", async () => {
    staff.current = { id: "u1", email: "e@x.test", role: "editor" };
    const { saveVehicle } = await actions();
    const state = await saveVehicle(null, emptyState(), validForm({ price: "not a number" }));
    expect(state.errors.price).toBeTruthy();
    expect(state.message).toBe("Please fix the highlighted fields.");
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("refuses a photo hosted outside the project bucket", async () => {
    staff.current = { id: "u1", email: "e@x.test", role: "editor" };
    const fd = validForm();
    fd.set("image_url", "https://images.example.com/stolen.jpg");
    const { saveVehicle } = await actions();
    const state = await saveVehicle(null, emptyState(), fd);
    expect(state.errors.images).toContain("images.example.com");
    expect(db.insert).not.toHaveBeenCalled();
  });
});

describe("saveVehicle: writes", () => {
  it("inserts a new vehicle with a generated id and sends the user to the list", async () => {
    staff.current = { id: "u1", email: "e@x.test", role: "editor" };
    const { saveVehicle } = await actions();
    await expect(saveVehicle(null, emptyState(), validForm())).rejects.toThrow(`${REDIRECT};/admin`);
    expect(db.insert).toHaveBeenCalledTimes(1);
    const row = db.insert.mock.calls[0][0] as { id: string; reference: string; currency: string };
    expect(row.id).toMatch(/^v-toyota-corolla-2022-[0-9a-f]{6}$/);
    expect(row.reference).toBe("PC-TOY-0001");
    expect(row.currency).toBe("XAF");
  });

  it("explains a duplicate stock reference against the reference field", async () => {
    staff.current = { id: "u1", email: "e@x.test", role: "editor" };
    db.error = { code: "23505", message: "duplicate key" };
    const { saveVehicle } = await actions();
    const state = await saveVehicle(null, emptyState(), validForm());
    expect(state.errors.reference).toMatch(/already used/);
  });

  it("reports when an update matches no row (missing, or blocked by row-level security)", async () => {
    staff.current = { id: "u1", email: "e@x.test", role: "editor" };
    db.affected = [];
    const { saveVehicle } = await actions();
    const state = await saveVehicle("v-gone", emptyState(), validForm());
    expect(state.message).toMatch(/no longer exists|can't edit/);
  });

  it("deletes photos that were removed from an existing vehicle, but only ours", async () => {
    staff.current = { id: "u1", email: "e@x.test", role: "editor" };
    db.existingImages = [{ url: photo("old") }, { url: photo("corolla") }];
    const { saveVehicle } = await actions();
    await expect(saveVehicle("v-1", emptyState(), validForm())).rejects.toThrow(REDIRECT);
    // `corolla` is still used by the saved vehicle, so only `old` is removed.
    expect(db.storageRemove).toHaveBeenCalledWith(["vehicles/old.jpg"]);
  });
});

describe("setVehicleStatus and setVehicleFeatured", () => {
  it("rejects a status outside the allowed list before writing", async () => {
    staff.current = { id: "u1", email: "e@x.test", role: "editor" };
    const { setVehicleStatus } = await actions();
    const fd = new FormData();
    fd.set("id", "v-1");
    fd.set("status", "Stolen");
    await expect(setVehicleStatus(fd)).rejects.toThrow("Invalid status update.");
  });

  it("requires staff rights before changing status", async () => {
    const { setVehicleStatus } = await actions();
    const fd = new FormData();
    fd.set("id", "v-1");
    fd.set("status", "Sold");
    await expect(setVehicleStatus(fd)).rejects.toThrow(REDIRECT);
  });
});

describe("deleteVehicle", () => {
  function deleteForm(id = "v-1") {
    const fd = new FormData();
    fd.set("id", id);
    return fd;
  }

  it("lets an administrator delete a vehicle", async () => {
    staff.current = { id: "a1", email: "admin@x.test", role: "admin" };
    const { deleteVehicle } = await actions();
    await deleteVehicle(deleteForm());
    expect(db.delete).toHaveBeenCalledTimes(1);
  });

  it("refuses an editor, without touching the database", async () => {
    staff.current = { id: "u1", email: "e@x.test", role: "editor" };
    const { deleteVehicle } = await actions();
    await expect(deleteVehicle(deleteForm())).rejects.toThrow("Only administrators can delete vehicles.");
    expect(db.delete).not.toHaveBeenCalled();
  });

  it("refuses a signed-out visitor", async () => {
    const { deleteVehicle } = await actions();
    await expect(deleteVehicle(deleteForm())).rejects.toThrow(REDIRECT);
    expect(db.delete).not.toHaveBeenCalled();
  });

  it("reports a vehicle that does not exist instead of silently succeeding", async () => {
    staff.current = { id: "a1", email: "admin@x.test", role: "admin" };
    db.affected = [];
    const { deleteVehicle } = await actions();
    await expect(deleteVehicle(deleteForm("v-missing"))).rejects.toThrow("Vehicle not found");
  });
});

function emptyState() {
  return {
    draft: {} as never,
    errors: {},
  };
}
