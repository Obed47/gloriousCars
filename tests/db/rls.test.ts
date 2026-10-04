/**
 * @vitest-environment node
 *
 * Runs the project's real SQL migrations against an in-process Postgres
 * (PGlite) and checks who may read and write what. This is the last line of
 * defence in the app, so it is tested directly rather than assumed.
 *
 * Supabase provides a few things the migrations rely on (the `auth` and
 * `storage` schemas, the `anon` and `authenticated` roles, and default table
 * grants on `public`). They are recreated minimally below.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const MIGRATIONS = [
  "20260908000000_initial_schema.sql",
  "20260920000000_staff_access_hardening.sql",
  "20260920010000_vehicle_images_storage.sql",
].map((name) => readFileSync(join(process.cwd(), "supabase/migrations", name), "utf8"));

const PLATFORM = `
  create role anon nologin;
  create role authenticated nologin;

  create schema auth;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    created_at timestamptz not null default now()
  );
  -- Supabase reads the signed-in user's id from the JWT claims.
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;

  create schema storage;
  create table storage.buckets (
    id text primary key,
    name text not null,
    public boolean default false,
    file_size_limit bigint,
    allowed_mime_types text[]
  );
  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets(id),
    name text,
    owner uuid,
    created_at timestamptz not null default now()
  );
  alter table storage.objects enable row level security;

  -- Supabase grants the API roles access to the public schema by default.
  grant usage on schema public, auth, storage to anon, authenticated;
  grant select on auth.users to authenticated;
`;

const DEFAULT_GRANTS = `
  grant select, insert, update, delete on all tables in schema public to anon, authenticated;
  grant select on storage.buckets to anon, authenticated;
  grant select, insert, delete on storage.objects to authenticated;
`;

const STAFF_EDITOR = "00000000-0000-0000-0000-00000000000e";
const STAFF_ADMIN = "00000000-0000-0000-0000-00000000000a";
const NEW_SIGNUP = "00000000-0000-0000-0000-0000000000ff";
const OTHER_EDITOR = "00000000-0000-0000-0000-0000000000e2";

let db: PGlite;

beforeAll(async () => {
  db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec(PLATFORM);
  for (const sql of MIGRATIONS) await db.exec(sql);
  await db.exec(DEFAULT_GRANTS);

  await db.exec(`
    insert into auth.users (id, email) values
      ('${STAFF_EDITOR}', 'editor@example.test'),
      ('${STAFF_ADMIN}', 'admin@example.test'),
      ('${OTHER_EDITOR}', 'other@example.test'),
      ('${NEW_SIGNUP}', 'signup@example.test');
    insert into public.profiles (id, role) values
      ('${STAFF_EDITOR}', 'editor'),
      ('${STAFF_ADMIN}', 'admin'),
      ('${OTHER_EDITOR}', 'editor');
  `);
});

afterAll(async () => {
  await db?.close();
});

/** Runs as the given Postgres role, with `uid` as the signed-in user (or none). */
async function as(role: "anon" | "authenticated", uid?: string) {
  await db.exec("reset role;");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid ?? ""]);
  await db.exec(`set role ${role};`);
}

/** Runs as the database owner, bypassing row-level security (test setup only). */
async function asOwner() {
  await db.exec("reset role;");
  await db.query("select set_config('request.jwt.claim.sub', '', false)");
}

const vehicleRow = (id: string, status: string, extra = "") => `
  insert into public.vehicles
    (id, reference, brand, model, year, price, fuel_type, transmission, engine,
     horsepower, drive_type, body_type, color, seats, doors, condition, status,
     location, description)
  values
    ('${id}', 'REF-${id}', 'BMW', 'X5', 2024, 68500000, 'Petrol', 'Automatic', '3.0',
     335, 'AWD', 'SUV', 'White', 5, 5, 'Used', '${status}', 'Yaoundé', 'Test car' ${extra});
`;

async function seedVehicles() {
  await asOwner();
  await db.exec("delete from public.vehicles;");
  await db.exec(vehicleRow("v-available", "Available"));
  await db.exec(vehicleRow("v-reserved", "Reserved"));
  await db.exec(vehicleRow("v-sold", "Sold"));
}

const ids = async (role: "anon" | "authenticated", uid?: string) => {
  await as(role, uid);
  const { rows } = await db.query<{ id: string }>("select id from public.vehicles order by id");
  return rows.map((r) => r.id);
};

describe("migrations", () => {
  it("apply again without errors (they can be re-run safely)", async () => {
    await asOwner();
    for (const sql of MIGRATIONS) await expect(db.exec(sql)).resolves.toBeDefined();
  });
});

describe("public catalogue", () => {
  beforeEach(seedVehicles);

  it("lets a visitor read available and reserved vehicles", async () => {
    expect(await ids("anon")).toEqual(["v-available", "v-reserved"]);
  });

  it("never shows a sold vehicle to a visitor", async () => {
    expect(await ids("anon")).not.toContain("v-sold");
  });

  it("hides sold vehicles from a signed-in customer too", async () => {
    const customer = "00000000-0000-0000-0000-0000000000c1";
    await asOwner();
    await db.exec(`insert into auth.users (id, email) values ('${customer}', 'c@example.test')`);
    expect(await ids("authenticated", customer)).not.toContain("v-sold");
  });

  it("lets staff see sold vehicles too, for the admin list", async () => {
    expect(await ids("authenticated", STAFF_EDITOR)).toEqual(["v-available", "v-reserved", "v-sold"]);
  });
});

describe("vehicle writes", () => {
  beforeEach(seedVehicles);

  it("stops a visitor from adding a vehicle", async () => {
    await as("anon");
    await expect(db.exec(vehicleRow("v-hacked", "Available"))).rejects.toThrow(/row-level security|permission denied/);
  });

  it("stops a visitor from changing a price", async () => {
    await as("anon");
    const { rows } = await db.query("update public.vehicles set price = 1 where id = 'v-available' returning id");
    expect(rows).toHaveLength(0);
  });

  it("lets an editor add and update vehicles", async () => {
    await as("authenticated", STAFF_EDITOR);
    await db.exec(vehicleRow("v-new", "Available"));
    const { rows } = await db.query(
      "update public.vehicles set status = 'Reserved' where id = 'v-new' returning id",
    );
    expect(rows).toHaveLength(1);
  });

  it("does not let an editor delete a vehicle", async () => {
    await as("authenticated", STAFF_EDITOR);
    const { rows } = await db.query("delete from public.vehicles where id = 'v-available' returning id");
    expect(rows).toHaveLength(0);
  });

  it("lets an administrator delete a vehicle", async () => {
    await as("authenticated", STAFF_ADMIN);
    const { rows } = await db.query("delete from public.vehicles where id = 'v-available' returning id");
    expect(rows).toHaveLength(1);
  });

  it("refuses a new sign-up that is not on the staff list", async () => {
    await as("authenticated", NEW_SIGNUP);
    await expect(db.exec(vehicleRow("v-signup", "Available"))).rejects.toThrow(/row-level security/);
  });

  it("enforces the data rules even for staff", async () => {
    await as("authenticated", STAFF_EDITOR);
    await expect(db.exec(vehicleRow("v-bad-year", "Available").replace("2024", "1800"))).rejects.toThrow(
      /violates check constraint/,
    );
    await expect(db.exec(vehicleRow("v-bad-status", "Pending"))).rejects.toThrow(/violates check constraint/);
  });
});

describe("staff accounts", () => {
  it("does not hand a new sign-up staff rights automatically", async () => {
    await asOwner();
    const { rows } = await db.query("select 1 from public.profiles where id = $1", [NEW_SIGNUP]);
    expect(rows).toHaveLength(0);
  });

  it("lets a staff member read only their own profile", async () => {
    await as("authenticated", STAFF_EDITOR);
    const { rows } = await db.query<{ id: string }>("select id from public.profiles order by id");
    expect(rows.map((r) => r.id)).toEqual([STAFF_EDITOR]);
  });

  it("does not let an editor promote themselves to admin", async () => {
    await as("authenticated", STAFF_EDITOR);
    const { rows } = await db.query(
      "update public.profiles set role = 'admin' where id = $1 returning id",
      [STAFF_EDITOR],
    );
    expect(rows).toHaveLength(0);
    await asOwner();
    const check = await db.query<{ role: string }>("select role from public.profiles where id = $1", [STAFF_EDITOR]);
    expect(check.rows[0].role).toBe("editor");
  });

  it("does not expose the staff list to visitors", async () => {
    await as("anon");
    const { rows } = await db.query("select id from public.profiles");
    expect(rows).toHaveLength(0);
  });
});

describe("photo storage", () => {
  beforeEach(async () => {
    await asOwner();
    await db.exec("delete from storage.objects;");
    await db.exec(`
      insert into storage.buckets (id, name, public) values ('vehicle-images', 'vehicle-images', true)
        on conflict (id) do nothing;
      insert into storage.objects (bucket_id, name, owner) values ('vehicle-images', 'vehicles/existing.jpg', '${STAFF_EDITOR}');
    `);
  });

  it("records the bucket as public with a size and type limit", async () => {
    await asOwner();
    const { rows } = await db.query<{ public: boolean; file_size_limit: string; allowed_mime_types: string[] }>(
      "select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'vehicle-images'",
    );
    expect(rows[0].public).toBe(true);
    expect(Number(rows[0].file_size_limit)).toBe(10 * 1024 * 1024);
    expect(rows[0].allowed_mime_types).toEqual(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  });

  it("lets staff upload photos to the vehicle-images bucket", async () => {
    await as("authenticated", STAFF_EDITOR);
    await db.exec("insert into storage.objects (bucket_id, name) values ('vehicle-images', 'vehicles/new.jpg')");
  });

  it("stops a visitor from uploading photos", async () => {
    await as("anon");
    await expect(
      db.exec("insert into storage.objects (bucket_id, name) values ('vehicle-images', 'vehicles/x.jpg')"),
    ).rejects.toThrow(/row-level security|permission denied/);
  });

  it("stops a signed-in customer (not staff) from uploading photos", async () => {
    await as("authenticated", NEW_SIGNUP);
    await expect(
      db.exec("insert into storage.objects (bucket_id, name) values ('vehicle-images', 'vehicles/x.jpg')"),
    ).rejects.toThrow(/row-level security/);
  });

  it("stops staff from writing into other buckets", async () => {
    await asOwner();
    await db.exec("insert into storage.buckets (id, name, public) values ('private-docs', 'private-docs', false) on conflict do nothing");
    await as("authenticated", STAFF_EDITOR);
    await expect(
      db.exec("insert into storage.objects (bucket_id, name) values ('private-docs', 'contract.pdf')"),
    ).rejects.toThrow(/row-level security/);
  });

  it("lets staff remove a photo", async () => {
    await as("authenticated", STAFF_EDITOR);
    const { rows } = await db.query(
      "delete from storage.objects where name = 'vehicles/existing.jpg' returning id",
    );
    expect(rows).toHaveLength(1);
  });

  it("does not let a visitor remove a photo", async () => {
    await as("anon");
    const { rows } = await db.query("delete from storage.objects where name = 'vehicles/existing.jpg' returning id");
    expect(rows).toHaveLength(0);
  });
});

describe("helper functions", () => {
  it("reports staff and admin status correctly", async () => {
    await as("authenticated", STAFF_ADMIN);
    expect((await db.query<{ v: boolean }>("select public.is_staff() as v")).rows[0].v).toBe(true);
    expect((await db.query<{ v: boolean }>("select public.is_admin() as v")).rows[0].v).toBe(true);
    await as("authenticated", STAFF_EDITOR);
    expect((await db.query<{ v: boolean }>("select public.is_admin() as v")).rows[0].v).toBe(false);
    await as("anon");
    expect((await db.query<{ v: boolean }>("select public.is_staff() as v")).rows[0].v).toBe(false);
  });
});
