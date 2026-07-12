-- A fourth instance of the same bug family fixed in the previous two
-- migrations, caught by actually driving a payment-screenshot upload
-- end to end: `payment_screenshots_insert_anon` (on storage.objects)
-- checks `exists (select 1 from public.orders o where o.id = ... and
-- o.hostel_id = ...)` — anon has no SELECT visibility into `orders`
-- under RLS, so this has always evaluated false for every anon upload,
-- regardless of how real the order was. The screenshot upload step of
-- Payment (Phase 2 §8) has never actually worked.
--
-- Fixed with the same SECURITY DEFINER pattern as order_row_exists(),
-- extended to also check the hostel_id in the storage path actually
-- matches the order's real hostel — the same safety property the
-- original (broken) check was trying to enforce.

create function public.order_belongs_to_hostel(p_order_id uuid, p_hostel_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.orders
    where id = p_order_id and hostel_id = p_hostel_id
  );
$$;

drop policy payment_screenshots_insert_anon on storage.objects;
create policy payment_screenshots_insert_anon
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'payment-screenshots'
    and public.order_belongs_to_hostel(
      ((storage.foldername(name))[2])::uuid,
      ((storage.foldername(name))[1])::uuid
    )
  );
