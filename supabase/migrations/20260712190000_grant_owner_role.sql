-- Grants the real owner account (owner@nc.com, created manually via the
-- Supabase Dashboard since self-serve staff signup doesn't exist yet —
-- Phase 4 §22) the 'owner' role for the demo hostel. Without this,
-- `is_staff_of()`/`has_permission()` (both keyed off `profile_roles`)
-- silently returned false for every check, which explains three
-- separately reported symptoms at once: the Order Queue showed no
-- orders (`orders_select_staff` uses `is_staff_of`), and product
-- create/update/hide all failed with "new row violates row-level
-- security policy" (`products_write_staff`/`stock_history_insert_staff`
-- use `has_permission`).

do $$
declare
  v_profile_id uuid;
  v_hostel_id uuid;
  v_owner_role_id uuid;
begin
  select id into v_profile_id from auth.users where email = 'owner@nc.com';
  select id into v_hostel_id from public.hostels where slug = 'demo-hostel';
  select id into v_owner_role_id from public.roles where slug = 'owner';

  if v_profile_id is null or v_hostel_id is null or v_owner_role_id is null then
    raise notice 'owner account, demo-hostel, or owner role not found — skipping grant';
    return;
  end if;

  insert into public.profile_roles (profile_id, role_id, hostel_id)
  values (v_profile_id, v_owner_role_id, v_hostel_id)
  on conflict (profile_id, role_id, hostel_id) do nothing;
end $$;
