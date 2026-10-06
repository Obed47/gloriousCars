/**
 * @vitest-environment node
 *
 * Checks that the app's data mapping and the real database schema agree.
 * The app writes with `vehicleToRow` and reads with `rowToVehicle`; both must
 * match the columns the migrations leave behind, or saves and pages break in production.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { rowToVehicle, vehicleToRow, type VehicleRow } from "@/lib/supabase/vehicles";
import { makeVehicle, toVehicleInput } from "../fixtures/vehicles";

const migration = (name: string) =>
  readFileSync(join(process.cwd(), "supabase/migrations", name), "utf8");
const INITIAL = migration("20260908000000_initial_schema.sql");
const SIMPLIFY = migration("20261006000000_simplify_vehicles.sql");

/** An in-process Postgres with the Supabase pieces the migrations rely on. */
async function createDatabase(): Promise<PGlite> {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key default gen_random_uuid());
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid);
    alter table storage.objects enable row level security;
  `);
  return db;
}

async function vehicleColumns(db: PGlite): Promise<string[]> {
  const { rows } = await db.query<{ column_name: string }>(
    `select column_name from information_schema.columns
      where table_schema = 'public' and table_name = 'vehicles'`,
  );
  return rows.map((r) => r.column_name);
}

let db: PGlite;
let schemaColumns: string[];

beforeAll(async () => {
  db = await createDatabase();
  await db.exec(INITIAL);
  await db.exec(SIMPLIFY);
  schemaColumns = await vehicleColumns(db);
});

afterAll(async () => {
  await db?.close();
});

describe("vehicle columns", () => {
  it("found the column list after the migrations", () => {
    expect(schemaColumns).toEqual(expect.arrayContaining(["id", "reference", "name", "fuel_type", "listed_at", "images"]));
  });

  it("drops the attributes the admin no longer collects", () => {
    for (const retired of [
      "model", "trim", "condition", "engine", "horsepower", "drive_type", "body_type", "highlights", "features",
    ]) {
      expect(schemaColumns, retired).not.toContain(retired);
    }
  });

  it("every column the app writes exists in the schema", () => {
    const written = Object.keys(vehicleToRow(toVehicleInput(makeVehicle())));
    expect(written.filter((column) => !schemaColumns.includes(column))).toEqual([]);
  });

  it("every column the app reads exists in the schema", () => {
    // VehicleRow is the shape PostgREST returns for `select *`.
    const sample: Record<keyof VehicleRow, unknown> = {
      id: "", reference: "", name: "", brand: "", year: 0, price: 0, currency: "XAF",
      mileage: 0, fuel_type: "Petrol", transmission: "Manual", color: "", seats: 0, doors: 0,
      status: "Available", featured: false, location: "", description: "", images: [], listed_at: "",
    };
    expect(Object.keys(sample).filter((column) => !schemaColumns.includes(column))).toEqual([]);
  });

  it("the schema has no vehicle column the app never writes, other than generated ones", () => {
    const written = new Set(Object.keys(vehicleToRow(toVehicleInput(makeVehicle()))));
    const generated = new Set(["id", "listed_at", "created_at", "updated_at"]);
    const unused = schemaColumns.filter((c) => !written.has(c) && !generated.has(c));
    expect(unused).toEqual([]);
  });
});

describe("write then read through the real schema", () => {
  it("a vehicle the admin saves comes back unchanged", async () => {
    const vehicle = makeVehicle();
    const row = vehicleToRow(toVehicleInput(vehicle));
    await db.exec("reset role;");
    const inserted = await db.query<VehicleRow>(
      `insert into public.vehicles (id, reference, name, brand, year, price, currency, mileage,
         fuel_type, transmission, color, seats, doors, status, featured, location, description, images)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18::jsonb)
       returning *`,
      [
        vehicle.id, row.reference, row.name, row.brand, row.year, row.price, row.currency, row.mileage,
        row.fuel_type, row.transmission, row.color, row.seats, row.doors, row.status, row.featured,
        row.location, row.description, JSON.stringify(row.images),
      ],
    );
    const read = rowToVehicle({ ...inserted.rows[0], price: String(inserted.rows[0].price) } as VehicleRow);
    expect(read.reference).toBe(vehicle.reference);
    expect(read.name).toBe(vehicle.name);
    expect(read.brand).toBe(vehicle.brand);
    expect(read.price).toBe(vehicle.price);
    expect(read.images).toEqual(vehicle.images);
    expect(read.fuelType).toBe(vehicle.fuelType);
  });
});

describe("migration of existing cars", () => {
  it("gives each car the name brand + model and keeps its brand", async () => {
    // Build the table as it was before this migration, add a car, then migrate.
    const legacy = await createDatabase();
    try {
      await legacy.exec(INITIAL);
      await legacy.exec(`
        insert into public.vehicles
          (id, reference, brand, model, trim, year, price, mileage, fuel_type, transmission,
           engine, horsepower, drive_type, body_type, color, seats, doors, condition, status,
           location, description)
        values
          ('v-old', 'PC-OLD-1', 'Toyota', 'Land Cruiser', 'Prado', 2020, 30000000, 5000, 'Diesel', 'Automatic',
           '2.8L', 177, '4WD', 'SUV', 'White', 7, 5, 'Used', 'Available', 'Douala', 'Old car');
      `);
      await legacy.exec(SIMPLIFY);
      const { rows } = await legacy.query<{ name: string; brand: string }>(
        "select name, brand from public.vehicles where id = 'v-old'",
      );
      expect(rows).toEqual([{ name: "Toyota Land Cruiser", brand: "Toyota" }]);
    } finally {
      await legacy.close();
    }
  });
});
