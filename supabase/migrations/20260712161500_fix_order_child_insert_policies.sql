-- A third bug in the same family as the previous migration, caught by
-- driving the same checkout flow end to end after fixing the first two:
-- `order_items_insert_anon`, `payments_insert_anon`, and
-- `payment_screenshots_insert_anon` all gate on
-- `exists (select 1 from <parent table> where id = ...)` — but anon has
-- no SELECT policy on `orders` or `payments` (both hold PII), so under
-- RLS that EXISTS always evaluates to false for an anon caller, no
-- matter how real the parent row is. Every anon insert on these three
-- tables has been rejected since they were created; nothing surfaced it
-- before because payment/order-item logging had never been driven
-- against the live remote schema end to end until now.
--
-- Fixed the same way `is_staff_of`/`has_permission` already solve this
-- exact recursive-visibility problem: a SECURITY DEFINER helper that
-- checks existence with the function owner's privilege, bypassing the
-- caller's own RLS visibility into the parent table, while still
-- returning nothing but a boolean — no new data exposure.

create function public.order_row_exists(p_order_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.orders where id = p_order_id);
$$;

create function public.payment_row_exists(p_payment_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.payments where id = p_payment_id);
$$;

drop policy order_items_insert_anon on public.order_items;
create policy order_items_insert_anon
  on public.order_items for insert
  to anon, authenticated
  with check (public.order_row_exists(order_id));

drop policy payments_insert_anon on public.payments;
create policy payments_insert_anon
  on public.payments for insert
  to anon, authenticated
  with check (public.order_row_exists(order_id));

drop policy payment_screenshots_insert_anon on public.payment_screenshots;
create policy payment_screenshots_insert_anon
  on public.payment_screenshots for insert
  to anon, authenticated
  with check (public.payment_row_exists(payment_id));
