-- Fixes a real inconsistency caught while building Stage 6 Checkout: the
-- original orders_insert_anon policy (in
-- 20260712090000_catalogue_orders_payments.sql) required the hostel to be
-- 'open' to insert an order at all. That contradicts Phase 2 §11's
-- explicit design — a closed store still accepts orders, which queue for
-- opening rather than being rejected outright. Fixing forward with a new
-- migration rather than editing the original, per the additive-migration
-- discipline stated throughout this project.

drop policy orders_insert_anon on public.orders;

create policy orders_insert_anon
  on public.orders for insert
  to anon, authenticated
  with check (
    exists (select 1 from public.hostels h where h.id = orders.hostel_id)
  );

-- get_payment_for_order — the same capability-URL pattern as
-- get_order_tracking(), so the Payment screen (Stage 6) can look up the
-- payment row it needs to attach a screenshot to without any anon SELECT
-- grant on `payments` existing.
create function public.get_payment_for_order(p_order_id uuid)
returns table (
  id uuid,
  status public.payment_status,
  claimed_amount numeric
)
language sql
security definer
stable
set search_path = public
as $$
  select id, status, claimed_amount
  from public.payments
  where order_id = p_order_id;
$$;

grant execute on function public.get_payment_for_order(uuid) to anon, authenticated;

-- Second gap caught while building Stage 6 Checkout: `customers` had no
-- anon write policy at all, so the checkout Server Action's upsert
-- (insert-or-update-by-phone) would fail outright. Adds narrow anon
-- insert/update, with payment_flag_count still protected by column grant
-- — and re-creates increment_payment_flag_count as SECURITY DEFINER (it
-- wasn't, in the original migration) so the trigger can write that column
-- as the table owner regardless of the invoking role's own grants, the
-- same technique already used for is_staff_of/has_permission.
create policy customers_insert_anon
  on public.customers for insert
  to anon, authenticated
  with check (
    exists (select 1 from public.hostels h where h.id = customers.hostel_id)
  );

create policy customers_update_anon
  on public.customers for update
  to anon, authenticated
  using (
    exists (select 1 from public.hostels h where h.id = customers.hostel_id)
  )
  with check (
    exists (select 1 from public.hostels h where h.id = customers.hostel_id)
  );

revoke update on public.customers from anon, authenticated;
grant update (full_name, room_number) on public.customers to anon, authenticated;

create or replace function public.increment_payment_flag_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'rejected' and old.status is distinct from 'rejected' then
    update public.customers
    set payment_flag_count = payment_flag_count + 1
    where id = (select customer_id from public.orders where id = new.order_id);
  end if;
  return new;
end;
$$;
