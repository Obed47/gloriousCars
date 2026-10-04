create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id text primary key,
  reference text not null unique,
  brand text not null,
  model text not null,
  trim text,
  year integer not null check (year between 1900 and 2100),
  price numeric not null check (price >= 0),
  currency text not null default 'XAF' check (currency = 'XAF'),
  mileage integer not null default 0 check (mileage >= 0),
  fuel_type text not null check (fuel_type in ('Petrol', 'Diesel', 'Hybrid', 'Electric')),
  transmission text not null check (transmission in ('Automatic', 'Manual')),
  engine text not null,
  horsepower integer not null default 0 check (horsepower >= 0),
  drive_type text not null check (drive_type in ('FWD', 'RWD', 'AWD', '4WD')),
  body_type text not null check (body_type in ('SUV', 'Sedan', 'Coupe', 'Hatchback', 'Pickup', 'Convertible', 'Wagon', 'Van')),
  color text not null,
  seats integer not null check (seats > 0),
  doors integer not null check (doors > 0),
  condition text not null check (condition in ('New', 'Used')),
  status text not null default 'Available' check (status in ('Available', 'Reserved', 'Sold')),
  featured boolean not null default false,
  location text not null,
  description text not null,
  highlights jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  listed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vehicles_status_idx on public.vehicles(status);
create index if not exists vehicles_featured_idx on public.vehicles(featured) where featured = true;
create index if not exists vehicles_brand_idx on public.vehicles(brand);
create index if not exists vehicles_location_idx on public.vehicles(location);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'editor')
  );
$$;

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;

drop policy if exists "Public can view available vehicles" on public.vehicles;
create policy "Public can view available vehicles"
  on public.vehicles for select
  using (status <> 'Sold');

drop policy if exists "Staff can view all vehicles" on public.vehicles;
create policy "Staff can view all vehicles"
  on public.vehicles for select
  to authenticated
  using (public.is_staff());

drop policy if exists "Staff can insert vehicles" on public.vehicles;
create policy "Staff can insert vehicles"
  on public.vehicles for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists "Staff can update vehicles" on public.vehicles;
create policy "Staff can update vehicles"
  on public.vehicles for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "Admins can delete vehicles" on public.vehicles;
create policy "Admins can delete vehicles"
  on public.vehicles for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'editor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
