-- Stage 3 (Database), second migration: catalogue, orders, and payments —
-- the slice Stage 6 (Customer Application) and Stage 7 (Owner Console)
-- need. Continues the additive-migration strategy started in
-- 20260711180000_identity_and_tenancy.sql (Phase 4 §18).
--
-- Adapted from Phase 4 §3 for a product decision made after that document:
-- customers never authenticate (see src/stores/customer-profile.ts) — so
-- there is no `orders.customer_id -> auth.users` chain. Instead:
--   - `customers` is a plain, non-auth table keyed by (hostel_id, phone),
--     upserted server-side at checkout — it's the Owner Console CRM
--     surface (Phase 3 §6) and the home for payment_flag_count, without
--     needing an account behind it.
--   - `orders` additionally snapshots customer_name/customer_phone/
--     room_number directly, per Phase 4 §3's own snapshotting principle:
--     an order's delivery details must never mutate if the customer's
--     saved profile changes later.
--   - Because there's no auth.uid() for a customer, order tracking after
--     checkout is a capability-URL pattern: the order's UUID (122 bits of
--     random entropy) is the credential. get_order_tracking() is a
--     SECURITY DEFINER RPC that returns a deliberately narrow field set to
--     anyone who supplies a valid order id — no raw SELECT grant on
--     `orders`/`payments` for anon exists. This is a considered tradeoff,
--     not an oversight: acceptable for this product's stakes, not
--     equivalent to real authentication.

-- ---------------------------------------------------------------------------
-- categories / products (Phase 4 §3)
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels (id) on delete cascade,
  name text not null,
  icon_url text,
  sort_order integer not null default 0,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_hostel_sort_idx
  on public.categories (hostel_id, sort_order);

create trigger set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create type public.product_status as enum ('active', 'hidden', 'deleted');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  description text,
  image_url text,
  price numeric(10, 2) not null check (price >= 0),
  cost_price numeric(10, 2) check (cost_price >= 0),
  stock_qty integer not null default 0 check (stock_qty >= 0),
  expiry_date date,
  search_keywords text[] not null default '{}',
  available_from time,
  available_until time,
  status public.product_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.products.cost_price is
  'Staff-only visibility (profit = price - cost_price) — never selected by '
  'the public catalogue query, enforced by column-level grant below, not '
  'just by the app remembering not to ask for it.';

comment on column public.products.status is
  'Soft delete only (Phase 3 §5) — "deleted" hides from every surface but '
  'preserves order-history integrity. No hard delete path exists.';

create index products_hostel_status_idx
  on public.products (hostel_id, status);

create index products_search_keywords_idx
  on public.products using gin (search_keywords);

create trigger set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- stock_history — append-only ground truth for stock changes (Phase 4 §3).
-- order_id is added as a column now (nullable) with its FK constraint
-- added once the orders table exists later in this same file.
-- ---------------------------------------------------------------------------
create type public.stock_change_reason as enum ('sale', 'restock', 'correction', 'expiry');

create table public.stock_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  delta integer not null,
  reason public.stock_change_reason not null,
  order_id uuid,
  actor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index stock_history_product_id_idx on public.stock_history (product_id);

-- Keeps products.stock_qty and the append-only log from ever drifting —
-- every stock mutation goes through an insert here, never a direct
-- `update products set stock_qty = ...` (Phase 4 §3 trigger note).
create function public.apply_stock_history()
returns trigger
language plpgsql
as $$
begin
  update public.products
  set stock_qty = stock_qty + new.delta
  where id = new.product_id;
  return new;
end;
$$;

create trigger apply_stock_history
  after insert on public.stock_history
  for each row execute function public.apply_stock_history();

-- ---------------------------------------------------------------------------
-- customers — non-auth CRM record, keyed by phone (see header comment).
-- ---------------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels (id) on delete cascade,
  phone text not null,
  full_name text not null,
  room_number text,
  payment_flag_count integer not null default 0 check (payment_flag_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hostel_id, phone)
);

create trigger set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- orders / order_items (Phase 4 §3)
-- ---------------------------------------------------------------------------
create type public.delivery_method as enum ('room_delivery', 'pickup');
create type public.order_status as enum (
  'awaiting_verification',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels (id) on delete restrict,
  customer_id uuid references public.customers (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  room_number text,
  delivery_method public.delivery_method not null,
  status public.order_status not null default 'awaiting_verification',
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),
  notes text,
  cancelled_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.orders.customer_name is
  'Snapshotted at order time, independent of customers.full_name — a '
  'later profile edit must never rewrite delivered-order history '
  '(Phase 4 §3).';

-- The exact shape of the Owner Console Order Queue's oldest-first-per-lane
-- query (Phase 3 §2, Phase 4 §12).
create index orders_hostel_status_created_idx
  on public.orders (hostel_id, status, created_at);

create trigger set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.stock_history
  add constraint stock_history_order_id_fkey
  foreign key (order_id) references public.orders (id) on delete set null;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  product_name_snapshot text not null,
  unit_price_snapshot numeric(10, 2) not null check (unit_price_snapshot >= 0),
  quantity integer not null check (quantity > 0)
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- payments / payment_screenshots (Phase 4 §3)
-- ---------------------------------------------------------------------------
create type public.payment_status as enum ('pending', 'approved', 'rejected', 'refunded');
create type public.payment_rejected_reason as enum ('wrong_amount', 'duplicate', 'unreadable', 'other');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  claimed_amount numeric(10, 2) not null check (claimed_amount >= 0),
  transaction_id text,
  status public.payment_status not null default 'pending',
  rejected_reason public.payment_rejected_reason,
  verified_by uuid references public.profiles (id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- Phase 4 §3, §6: increments the customer's flag count on rejection —
-- against `customers` now rather than `profiles`, since customers never
-- get a profiles row.
create function public.increment_payment_flag_count()
returns trigger
language plpgsql
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

create trigger increment_payment_flag_count
  after update on public.payments
  for each row execute function public.increment_payment_flag_count();

create table public.payment_screenshots (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete cascade,
  storage_path text not null,
  perceptual_hash char(16),
  created_at timestamptz not null default now()
);

create index payment_screenshots_payment_id_idx
  on public.payment_screenshots (payment_id);

create index payment_screenshots_hash_idx
  on public.payment_screenshots (perceptual_hash)
  where perceptual_hash is not null;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.stock_history enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_screenshots enable row level security;

-- categories/products: public read of the live catalogue; staff write.
create policy categories_select_public
  on public.categories for select
  to anon, authenticated
  using (not is_hidden);

create policy categories_select_staff
  on public.categories for select
  to authenticated
  using (public.is_staff_of(hostel_id));

create policy categories_write_staff
  on public.categories for all
  to authenticated
  using (public.has_permission(hostel_id, 'products.write'))
  with check (public.has_permission(hostel_id, 'products.write'));

create policy products_select_public
  on public.products for select
  to anon, authenticated
  using (status = 'active');

create policy products_select_staff
  on public.products for select
  to authenticated
  using (public.is_staff_of(hostel_id));

create policy products_write_staff
  on public.products for all
  to authenticated
  using (public.has_permission(hostel_id, 'products.write'))
  with check (public.has_permission(hostel_id, 'products.write'));

-- cost_price is staff-only even on a row the public policy already allows
-- reading (Phase 4 §13) — a column grant, same technique as
-- profiles.payment_flag_count in the previous migration.
revoke select on public.products from anon, authenticated;
grant select (
  id, hostel_id, category_id, name, description, image_url, price,
  stock_qty, expiry_date, search_keywords, available_from, available_until,
  status, created_at, updated_at
) on public.products to anon, authenticated;
grant select (cost_price) on public.products to authenticated;
-- (the staff RLS policy above still governs *which rows*; this grant only
-- governs which *columns* are visible even on a permitted row.)

create policy stock_history_select_staff
  on public.stock_history for select
  to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = stock_history.product_id
        and public.has_permission(p.hostel_id, 'inventory.read')
    )
  );

create policy stock_history_insert_staff
  on public.stock_history for insert
  to authenticated
  with check (
    exists (
      select 1 from public.products p
      where p.id = stock_history.product_id
        and public.has_permission(p.hostel_id, 'inventory.write')
    )
  );

-- customers: staff of the hostel only. No anon/authenticated-customer
-- access at all — there is no authenticated customer principal.
create policy customers_select_staff
  on public.customers for select
  to authenticated
  using (public.has_permission(hostel_id, 'customers.read'));

create policy customers_write_staff
  on public.customers for all
  to authenticated
  using (public.is_staff_of(hostel_id))
  with check (public.is_staff_of(hostel_id));

-- orders: anon may INSERT (place an order) but never SELECT the table
-- directly — tracking is exclusively through get_order_tracking() below.
-- Staff read/update per Phase 4 §6.
create policy orders_insert_anon
  on public.orders for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.hostels h
      where h.id = orders.hostel_id and h.status = 'open'
    )
  );

create policy orders_select_staff
  on public.orders for select
  to authenticated
  using (public.is_staff_of(hostel_id));

create policy orders_update_staff
  on public.orders for update
  to authenticated
  using (public.has_permission(hostel_id, 'orders.read'))
  with check (public.has_permission(hostel_id, 'orders.read'));

-- order_items follow the parent order: insertable alongside the order
-- (same request, same transaction), staff-readable via the parent's
-- policy.
create policy order_items_insert_anon
  on public.order_items for insert
  to anon, authenticated
  with check (
    exists (select 1 from public.orders o where o.id = order_items.order_id)
  );

create policy order_items_select_staff
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and public.is_staff_of(o.hostel_id)
    )
  );

-- payments: anon inserts the claim at checkout; only staff with
-- orders.verify_payment may approve/reject (Phase 4 §6).
create policy payments_insert_anon
  on public.payments for insert
  to anon, authenticated
  with check (
    exists (select 1 from public.orders o where o.id = payments.order_id)
  );

create policy payments_select_staff
  on public.payments for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id
        and public.is_staff_of(o.hostel_id)
    )
  );

create policy payments_update_staff
  on public.payments for update
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id
        and public.has_permission(o.hostel_id, 'orders.verify_payment')
    )
  )
  with check (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id
        and public.has_permission(o.hostel_id, 'orders.verify_payment')
    )
  );

create policy payment_screenshots_insert_anon
  on public.payment_screenshots for insert
  to anon, authenticated
  with check (
    exists (select 1 from public.payments p where p.id = payment_screenshots.payment_id)
  );

create policy payment_screenshots_select_staff
  on public.payment_screenshots for select
  to authenticated
  using (
    exists (
      select 1 from public.payments pay
      join public.orders o on o.id = pay.order_id
      where pay.id = payment_screenshots.payment_id
        and public.is_staff_of(o.hostel_id)
    )
  );

-- ---------------------------------------------------------------------------
-- get_order_tracking — the capability-URL read path for a customer with no
-- account (see header comment). Deliberately narrow: no customer PII
-- beyond what the tracking screen needs, no payment screenshot, no
-- financial detail beyond the total already shown at checkout.
-- ---------------------------------------------------------------------------
create function public.get_order_tracking(p_order_id uuid)
returns table (
  id uuid,
  status public.order_status,
  delivery_method public.delivery_method,
  total numeric,
  created_at timestamptz,
  updated_at timestamptz,
  payment_status public.payment_status
)
language sql
security definer
stable
set search_path = public
as $$
  select
    o.id,
    o.status,
    o.delivery_method,
    o.total,
    o.created_at,
    o.updated_at,
    p.status as payment_status
  from public.orders o
  left join public.payments p on p.order_id = o.id
  where o.id = p_order_id;
$$;

grant execute on function public.get_order_tracking(uuid) to anon, authenticated;
