-- A dedicated public bucket for hostel-level assets (UPI QR code, logo —
-- Phase 4 §7 named "logos" as its own bucket; this covers both under one
-- roof since neither is a product/category photo). Path convention:
-- {hostel_id}/{filename}, same staff-write / public-read shape as
-- product-images and category-images from the earlier storage migration.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hostel-assets', 'hostel-assets', true, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy hostel_assets_select_public
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'hostel-assets');

create policy hostel_assets_write_staff
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'hostel-assets'
    and public.has_permission(((storage.foldername(name))[1])::uuid, 'settings.write')
  )
  with check (
    bucket_id = 'hostel-assets'
    and public.has_permission(((storage.foldername(name))[1])::uuid, 'settings.write')
  );
