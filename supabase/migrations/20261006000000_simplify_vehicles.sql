-- Simplify the vehicle record for the admin form and the public pages.
--
-- `name` (make and model together, e.g. "Toyota Land Cruiser Prado") replaces
-- the separate brand and model. `brand` stays, so brand filters and brand
-- pages keep working; the app derives it from the name when a car is saved.
-- Existing cars get name = brand + model.
--
-- Trim, condition, engine, horsepower, drive type, body type, highlights and
-- features are removed. Those details are now given on WhatsApp.
-- Dropping a column is irreversible: back up the table first if you need the old values.
-- Safe to run again: each step checks whether it has already happened.

alter table public.vehicles add column if not exists name text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'vehicles' and column_name = 'model'
  ) then
    update public.vehicles
       set name = btrim(brand || ' ' || model)
     where name is null;
  end if;
end $$;

alter table public.vehicles alter column name set not null;

alter table public.vehicles
  drop column if exists model,
  drop column if exists trim,
  drop column if exists condition,
  drop column if exists engine,
  drop column if exists horsepower,
  drop column if exists drive_type,
  drop column if exists body_type,
  drop column if exists highlights,
  drop column if exists features;
