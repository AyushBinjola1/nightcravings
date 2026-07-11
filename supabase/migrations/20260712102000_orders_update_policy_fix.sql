-- Caught while building Stage 7's Order Queue actions: orders_update_staff
-- (in 20260712090000_catalogue_orders_payments.sql) only checked
-- has_permission(hostel_id, 'orders.read') — but the delivery_partner role
-- was deliberately seeded WITHOUT orders.read (Phase 4 §5: it only holds
-- orders.read_out_for_delivery + orders.mark_delivered), so a delivery
-- partner could never actually advance an order to Delivered. Broadens the
-- check to any of the three permissions that legitimately need to write an
-- order's status.

drop policy orders_update_staff on public.orders;

create policy orders_update_staff
  on public.orders for update
  to authenticated
  using (
    public.has_permission(hostel_id, 'orders.read')
    or public.has_permission(hostel_id, 'orders.mark_delivered')
    or public.has_permission(hostel_id, 'orders.verify_payment')
  )
  with check (
    public.has_permission(hostel_id, 'orders.read')
    or public.has_permission(hostel_id, 'orders.mark_delivered')
    or public.has_permission(hostel_id, 'orders.verify_payment')
  );
