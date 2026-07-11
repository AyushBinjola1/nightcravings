-- Stage 12 (Production Hardening) — fulfills the deferral stated in
-- 20260712094500_hostel_commerce_settings.sql: UPI id/number now go
-- through Supabase Vault (pgsodium-backed authenticated encryption)
-- instead of plain text columns, per Phase 4 §13.
--
-- upi_qr_url is deliberately NOT vaulted — it's a public Storage URL to an
-- image, not a secret; vaulting a URL string would add ceremony without
-- adding protection.
--
-- Two SECURITY DEFINER functions are the only way in or out:
--   - set_hostel_upi_details(): staff-only (settings.write_payment_identity),
--     writes to Vault via vault.create_secret()/vault.update_secret().
--   - get_hostel_payment_info(): anon + authenticated, since a customer
--     must see this to pay (Phase 2 §8) — decrypts via
--     vault.decrypted_secrets, which is otherwise inaccessible to anon.
-- Neither function is called from application code yet (no Store Settings
-- UI exists to call the writer) — this is real, callable infrastructure
-- ready for that screen, not a placeholder.

create extension if not exists supabase_vault cascade;

alter table public.hostels
  add column upi_id_secret_id uuid references vault.secrets (id),
  add column upi_number_secret_id uuid references vault.secrets (id);

-- The plaintext columns from the previous migration are dropped now,
-- before this schema has ever been applied anywhere with real data in
-- them — not a live migration risk, just replacing a not-yet-shipped
-- design with the correct one.
alter table public.hostels
  drop column upi_id,
  drop column upi_number;

create function public.set_hostel_upi_details(
  p_hostel_id uuid,
  p_upi_id text,
  p_upi_number text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_upi_id_secret uuid;
  v_upi_number_secret uuid;
begin
  if not public.has_permission(p_hostel_id, 'settings.write_payment_identity') then
    raise exception 'not authorized to write payment identity for this hostel';
  end if;

  select upi_id_secret_id, upi_number_secret_id
  into v_upi_id_secret, v_upi_number_secret
  from public.hostels
  where id = p_hostel_id;

  if v_upi_id_secret is null then
    v_upi_id_secret := vault.create_secret(p_upi_id, 'hostel_' || p_hostel_id || '_upi_id');
  else
    perform vault.update_secret(v_upi_id_secret, p_upi_id);
  end if;

  if v_upi_number_secret is null then
    v_upi_number_secret := vault.create_secret(p_upi_number, 'hostel_' || p_hostel_id || '_upi_number');
  else
    perform vault.update_secret(v_upi_number_secret, p_upi_number);
  end if;

  update public.hostels
  set upi_id_secret_id = v_upi_id_secret,
      upi_number_secret_id = v_upi_number_secret
  where id = p_hostel_id;
end;
$$;

-- Deliberately no grant to anon/authenticated on this function beyond
-- `authenticated` — a customer has no legitimate reason to ever call it,
-- and the has_permission() check inside is the real gate regardless.
grant execute on function public.set_hostel_upi_details(uuid, text, text) to authenticated;

create function public.get_hostel_payment_info(p_hostel_id uuid)
returns table (upi_id text, upi_number text, upi_qr_url text)
language sql
security definer
stable
set search_path = public
as $$
  select
    (select decrypted_secret from vault.decrypted_secrets where id = h.upi_id_secret_id),
    (select decrypted_secret from vault.decrypted_secrets where id = h.upi_number_secret_id),
    h.upi_qr_url
  from public.hostels h
  where h.id = p_hostel_id;
$$;

grant execute on function public.get_hostel_payment_info(uuid) to anon, authenticated;

-- The secret-id columns are opaque UUIDs pointing into Vault — harmless
-- if read, but hidden anyway so the schema doesn't casually expose
-- internal structure to anon. A column-level REVOKE alone would NOT do
-- this: Supabase's default table-wide `GRANT SELECT ON hostels` (applied
-- when the table was created) still stands underneath it, so the only
-- way to actually narrow access is to revoke the table-wide grant first,
-- then re-grant an explicit column list — the same pattern already used
-- for products.cost_price. Every `select("*")` on `hostels` in the app
-- must be an explicit column list from this point on (src/server/queries
-- already updated accordingly) — `SELECT *` fails outright in Postgres if
-- the caller lacks privilege on even one column, it does not silently
-- omit it.
revoke select on public.hostels from anon, authenticated;
grant select (
  id, name, slug, status, opening_time, closing_time,
  delivery_fee, free_delivery_threshold, upi_qr_url,
  created_at, updated_at
) on public.hostels to anon, authenticated;
