-- A direct contact number for the "Message the store" pattern specified
-- throughout Phase 2 (Profile's Support row, Search's empty-result
-- fallback, Store Closed's escalation link, Payment's verification
-- heartbeat) — none of those had anywhere to actually read a number from
-- until now. Public column: every customer-facing screen that shows it
-- has no auth, same trust level as the other hostel display fields
-- already granted to anon in migration 11.

alter table public.hostels
  add column support_phone text;

revoke select on public.hostels from anon, authenticated;
grant select (
  id, name, slug, status, opening_time, closing_time,
  delivery_fee, free_delivery_threshold, upi_qr_url, support_phone,
  created_at, updated_at
) on public.hostels to anon, authenticated;

update public.hostels
set support_phone = '7428124486'
where slug = 'demo-hostel';
