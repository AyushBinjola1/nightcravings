-- pgTAP — cross-tenant isolation (Phase 4 §6/§19: the hard CI gate this
-- project's own docs call for). NOT executed in this environment — no
-- Docker, no `supabase link` access token, so `supabase test db` can't
-- run here. Written to the same standard as if it could: run for real via
--
--   supabase test db tests/pgtap --linked
--   (or --local once Docker + `supabase start` are available)
--
-- once the Stage 3 migrations are applied. This file follows Supabase's
-- documented pattern for RLS testing: real rows, a real auth.users
-- identity, and `set local role authenticated` + a forged JWT claim to
-- exercise policies exactly as PostgREST would.
begin;

select plan(4);

insert into public.hostels (id, name, slug, status) values
  ('11111111-1111-4111-8111-111111111111', 'Hostel A', 'test-hostel-a', 'open'),
  ('22222222-2222-4222-8222-222222222222', 'Hostel B', 'test-hostel-b', 'open');

insert into auth.users (id, email) values
  ('33333333-3333-4333-8333-333333333333', 'owner-a@test.local');

insert into public.profile_roles (profile_id, role_id, hostel_id)
select '33333333-3333-4333-8333-333333333333', id, '11111111-1111-4111-8111-111111111111'
from public.roles where slug = 'owner';

insert into public.products (id, hostel_id, name, price, status) values
  ('55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', 'Hostel A Product', 10, 'active'),
  ('66666666-6666-4666-8666-666666666666', '22222222-2222-4222-8222-222222222222', 'Hostel B Product', 10, 'active');

insert into public.orders (id, hostel_id, customer_name, customer_phone, delivery_method, subtotal, total) values
  ('77777777-7777-4777-8777-777777777777', '22222222-2222-4222-8222-222222222222', 'Guest', '9876543210', 'pickup', 10, 10);

set local role authenticated;
set local "request.jwt.claims" to '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';

select is(
  (select count(*)::int from public.products where hostel_id = '22222222-2222-4222-8222-222222222222'),
  0,
  'Hostel A''s owner cannot see Hostel B''s products via the staff RLS policy'
);

select is(
  (select count(*)::int from public.products where hostel_id = '11111111-1111-4111-8111-111111111111'),
  1,
  'Hostel A''s owner CAN see Hostel A''s own products'
);

select is(
  (select count(*)::int from public.orders where hostel_id = '22222222-2222-4222-8222-222222222222'),
  0,
  'Hostel A''s owner cannot see Hostel B''s orders'
);

reset role;
set local role anon;

select is(
  (select count(*)::int from public.orders),
  0,
  'anon has no SELECT access to orders at all (capability-URL model — see migration header)'
);

select * from finish();

rollback;
