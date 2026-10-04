-- Storage for vehicle photos uploaded from the admin. Run after
-- 20260920000000_staff_access_hardening.sql (it relies on public.is_staff()).
--
-- The bucket is public so photos load from a plain URL, with no signed links
-- and no policy needed for visitors. Only staff can upload, list or delete.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-images',
  'vehicle-images',
  true,
  10485760, -- 10 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Staff can upload vehicle images" on storage.objects;
create policy "Staff can upload vehicle images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'vehicle-images' and public.is_staff());

-- Deleting an object also needs select access, so both are granted.
drop policy if exists "Staff can view vehicle images" on storage.objects;
create policy "Staff can view vehicle images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'vehicle-images' and public.is_staff());

drop policy if exists "Staff can delete vehicle images" on storage.objects;
create policy "Staff can delete vehicle images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'vehicle-images' and public.is_staff());
