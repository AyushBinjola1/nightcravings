-- Stage 3 (Database), third migration: storage buckets (Phase 4 §7).
--
-- Path convention every upload in the app must follow, since these RLS
-- policies parse the object path rather than trusting a client-supplied
-- hostel_id:
--   product-images / category-images:  {hostel_id}/{uuid}.{ext}
--   payment-screenshots:               {hostel_id}/{order_id}/{uuid}.{ext}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('category-images', 'category-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('payment-screenshots', 'payment-screenshots', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- product-images / category-images: public read (Phase 2's product cards
-- load unauthenticated); write restricted to staff of the hostel named in
-- the path's first segment.
create policy product_images_select_public
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy product_images_write_staff
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'product-images'
    and public.has_permission(((storage.foldername(name))[1])::uuid, 'products.write')
  )
  with check (
    bucket_id = 'product-images'
    and public.has_permission(((storage.foldername(name))[1])::uuid, 'products.write')
  );

create policy category_images_select_public
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'category-images');

create policy category_images_write_staff
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'category-images'
    and public.has_permission(((storage.foldername(name))[1])::uuid, 'products.write')
  )
  with check (
    bucket_id = 'category-images'
    and public.has_permission(((storage.foldername(name))[1])::uuid, 'products.write')
  );

-- payment-screenshots: private. Anon may upload proof of payment for a
-- real, existing order (checked against the orders table, not just trusted
-- from the path) — but may never read any screenshot back, matching the
-- "no anon SELECT on payments" stance in the previous migration. Staff of
-- the hostel in the path's first segment can read.
create policy payment_screenshots_insert_anon
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'payment-screenshots'
    and exists (
      select 1 from public.orders o
      where o.id = ((storage.foldername(name))[2])::uuid
        and o.hostel_id = ((storage.foldername(name))[1])::uuid
    )
  );

create policy payment_screenshots_select_staff
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'payment-screenshots'
    and public.is_staff_of(((storage.foldername(name))[1])::uuid)
  );
