-- pgTAP — role-scoped permissions (Phase 4 §5/§6). Same execution caveat
-- as 001_tenant_isolation.sql: written for real, not run in this
-- environment. Specifically covers the bug Stage 6/7 caught and fixed in
-- 20260712102000_orders_update_policy_fix.sql — a delivery_partner must
-- be able to mark an order Delivered despite not holding `orders.read`.
begin;

select plan(3);

insert into public.hostels (id, name, slug, status) values
  ('11111111-1111-4111-8111-111111111111', 'Hostel A', 'test-hostel-perms', 'open');

insert into auth.users (id, email) values
  ('88888888-8888-4888-8888-888888888888', 'delivery-a@test.local');

insert into public.profile_roles (profile_id, role_id, hostel_id)
select '88888888-8888-4888-8888-888888888888', id, '11111111-1111-4111-8111-111111111111'
from public.roles where slug = 'delivery_partner';

insert into public.orders
  (id, hostel_id, customer_name, customer_phone, delivery_method, status, subtotal, total)
values
  ('99999999-9999-4999-8999-999999999999', '11111111-1111-4111-8111-111111111111',
   'Guest', '9876543210', 'room_delivery', 'out_for_delivery', 10, 10);

set local role authenticated;
set local "request.jwt.claims" to '{"sub":"88888888-8888-4888-8888-888888888888","role":"authenticated"}';

select lives_ok(
  $$ update public.orders set status = 'delivered' where id = '99999999-9999-4999-8999-999999999999' $$,
  'delivery_partner CAN mark an order Delivered (orders_update_staff checks orders.mark_delivered, not just orders.read)'
);

select is(
  (select status::text from public.orders where id = '99999999-9999-4999-8999-999999999999'),
  'delivered',
  'the update actually took effect'
);

select is(
  (select count(*)::int from public.payments),
  0,
  'delivery_partner has no visibility into payments at all (no financial data, per Phase 4 §5)'
);

select * from finish();

rollback;
