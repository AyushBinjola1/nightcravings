-- Sets the demo hostel's real UPI id/number, provided directly by the
-- user for this purpose. Runs as the migration role (full privileges),
-- so it calls vault.create_secret()/vault.update_secret() directly rather
-- than through set_hostel_upi_details() — that RPC's has_permission()
-- check requires an authenticated staff auth.uid(), which doesn't exist
-- in a migration context, and shouldn't be bypassed for real app traffic.
-- This is a one-time seed operation, the same trust level as
-- seed_demo_catalogue.sql.

do $$
declare
  v_hostel_id uuid;
  v_upi_id_secret uuid;
  v_upi_number_secret uuid;
begin
  select id into v_hostel_id from public.hostels where slug = 'demo-hostel';

  if v_hostel_id is null then
    raise notice 'demo-hostel not found — skipping UPI seed';
    return;
  end if;

  select upi_id_secret_id, upi_number_secret_id
  into v_upi_id_secret, v_upi_number_secret
  from public.hostels
  where id = v_hostel_id;

  if v_upi_id_secret is null then
    v_upi_id_secret := vault.create_secret('7428124486@upi', 'hostel_' || v_hostel_id || '_upi_id');
  else
    perform vault.update_secret(v_upi_id_secret, '7428124486@upi');
  end if;

  if v_upi_number_secret is null then
    v_upi_number_secret := vault.create_secret('7428124486', 'hostel_' || v_hostel_id || '_upi_number');
  else
    perform vault.update_secret(v_upi_number_secret, '7428124486');
  end if;

  update public.hostels
  set upi_id_secret_id = v_upi_id_secret,
      upi_number_secret_id = v_upi_number_secret
  where id = v_hostel_id;
end $$;
