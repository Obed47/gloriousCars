-- Staff access hardening. Run after 20260908000000_initial_schema.sql.
--
-- 1. New sign-ups no longer become staff automatically. The old trigger gave
--    every new auth user the 'editor' role, and editors can insert/update
--    vehicles, so anyone able to sign up could edit the catalogue.
-- 2. Staff can read their own profile row (the admin UI needs it for the role).
-- 3. Admins can actually delete vehicles. The old delete policy queried
--    public.profiles directly, which returned nothing under RLS.

-- 1. Stop auto-granting staff access. Existing profile rows are left untouched.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Grant staff access explicitly, per user:
--   insert into public.profiles (id, role)
--   select id, 'editor' from auth.users where email = 'staff@example.com'
--   on conflict (id) do update set role = excluded.role;

-- 2. Role helper + own-profile read access.
create or replace function public.is_admin()
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
      and role = 'admin'
  );
$$;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- 3. Admin-only delete, evaluated through the security-definer helper.
drop policy if exists "Admins can delete vehicles" on public.vehicles;
create policy "Admins can delete vehicles"
  on public.vehicles for delete
  to authenticated
  using (public.is_admin());
