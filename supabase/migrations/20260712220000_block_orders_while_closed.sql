-- Reverses a deliberate Phase 2 §11 decision (queue orders while
-- closed, don't reject them — see 20260712095500_checkout_flow_fixes's
-- own comment) at the explicit, confirmed request of the product
-- owner: purchases are now blocked outright while the store isn't
-- 'open', both here (defense in depth) and in the `placeOrder` Server
-- Action (which gives the actual customer-facing error message this
-- policy alone can't).
drop policy orders_insert_anon on public.orders;
create policy orders_insert_anon
  on public.orders for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.hostels h
      where h.id = orders.hostel_id and h.status = 'open'
    )
  );
