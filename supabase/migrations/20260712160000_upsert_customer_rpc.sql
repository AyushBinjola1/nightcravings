-- Fixes two real checkout bugs caught while reproducing a live "Could not
-- place your order" report:
--
-- 1. `orders_insert_anon`'s WITH CHECK passes, but Checkout's server
--    action chains `.insert(...).select("id").single()` — supabase-js
--    turns that into `Prefer: return=representation`, which additionally
--    requires the caller to be able to SELECT the row back. anon has no
--    SELECT policy on `orders` (correctly — it holds every customer's
--    name/phone/room, Phase 4 §6's PII), so Postgres rejects the whole
--    INSERT with "new row violates row-level security policy", even
--    though the insert itself was allowed. Fixed in the Server Action
--    (not here) by generating the order id client-side and never
--    chaining `.select()` on that insert.
--
-- 2. The exact same shape of bug on `customers` (`.upsert(...).select
--    ("id").single()`) silently discarded its error, so `customer?.id`
--    was always `undefined` — every order's `customer_id` has been null
--    since Stage 6, with no visible symptom because nothing reads that
--    column back yet. Fixed here with a narrow SECURITY DEFINER RPC, the
--    same capability-URL-adjacent pattern already used for
--    get_order_tracking/get_payment_for_order: it performs the find-or-
--    create and returns only the id, without opening any SELECT policy
--    on the full `customers` row (which also holds payment_flag_count).
create function public.upsert_customer(
  p_hostel_id uuid,
  p_phone text,
  p_full_name text,
  p_room_number text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
begin
  insert into public.customers (hostel_id, phone, full_name, room_number)
  values (p_hostel_id, p_phone, p_full_name, p_room_number)
  on conflict (hostel_id, phone)
  do update set full_name = excluded.full_name, room_number = excluded.room_number
  returning id into v_customer_id;

  return v_customer_id;
end;
$$;

grant execute on function public.upsert_customer(uuid, text, text, text) to anon, authenticated;
