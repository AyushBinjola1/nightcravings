-- Stage 3 (Database), first migration: identity & tenancy only.
--
-- Scope is deliberately narrow — hostels, profiles, RBAC, and devices are
-- what Stage 2's auth flows need to mean anything. Catalogue, orders, and
-- payments (Phase 4 §3) arrive in later migrations when the features that
-- need them are actually built (Stage 6/7), per the additive,
-- expand-then-contract migration strategy in Phase 4 §18 — this is not a
-- partial implementation of Phase 4 §3, it is the first of several planned
-- migrations that together will implement it.
--
-- RLS policies for these tables are intentionally a separate migration
-- (20260711180100_identity_and_tenancy_rls.sql) so the schema and its
-- authorization rules are independently reviewable.

create extension if not exists pgcrypto;

-- Shared trigger function, reused by every mutable table's `updated_at`
-- column (Phase 4 §3) — declared once here rather than per table.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- hostels — the tenant root. Every other tenant-scoped table carries a
-- non-nullable hostel_id referencing this table (Phase 4 §3, §6).
-- ---------------------------------------------------------------------------
create type public.hostel_status as enum ('open', 'closed', 'maintenance');

create table public.hostels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status public.hostel_status not null default 'closed',
  opening_time time,
  closing_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.hostels is
  'Tenant root. Delivery fee, free-delivery threshold, and UPI identity '
  'are added in a later migration when Store Settings (Stage 7) is built — '
  'not needed by Stage 2/3 and deliberately not invented ahead of that.';

create trigger set_updated_at
  before update on public.hostels
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- profiles — 1:1 extension of auth.users (Phase 4 §3). Never a separate
-- identity; one row per authenticated principal, customer or staff.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  hostel_id uuid references public.hostels (id) on delete set null,
  full_name text,
  phone text unique,
  room_number text,
  payment_flag_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_flag_count_not_negative check (payment_flag_count >= 0)
);

comment on column public.profiles.hostel_id is
  'Nullable for a customer pre-first-order; always set for staff. Phase 4 §6 '
  'RLS note: a customer with no hostel_id yet can still read public '
  'catalogue rows — that policy checks hostel_id on the catalogue table, '
  'not this column.';

comment on column public.profiles.payment_flag_count is
  'Writable only by trg_payment_flag_increment once payments exist '
  '(Phase 4 §3, §6) — never directly writable by any client role.';

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Every auth.users row gets a matching profiles row automatically — the
-- standard Supabase pattern, so no application code path can create a user
-- without a profile (Phase 4 §4).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.phone
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RBAC — roles/permissions/role_permissions/profile_roles (Phase 4 §3, §5).
-- Customer authorization is identity-based, not role-based, so no
-- "customer" row exists here (Phase 4 §5).
-- ---------------------------------------------------------------------------
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  description text not null
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  action text not null unique,
  description text not null
);

comment on column public.permissions.action is
  'Dot-namespaced (e.g. "inventory.write") so new permissions extend '
  'without a schema change (Phase 4 §3).';

create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

-- A person can hold different roles at different hostels once multi-hostel
-- exists (Phase 4 §6 edge case: cross-tenant staff account) — hence
-- hostel_id here rather than a single denormalized role on profiles.
create table public.profile_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  hostel_id uuid not null references public.hostels (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, role_id, hostel_id)
);

create index profile_roles_profile_id_idx on public.profile_roles (profile_id);
create index profile_roles_hostel_id_idx on public.profile_roles (hostel_id);

insert into public.roles (slug, description) values
  ('owner', 'Full access — settings, financials, all screens.'),
  ('manager', 'All except payment identity settings and financial exports.'),
  ('inventory_manager', 'Inventory and product management; read-only elsewhere.'),
  ('delivery_partner', 'Out-for-delivery orders only; no financial or payment data.')
on conflict (slug) do nothing;

insert into public.permissions (action, description) values
  ('orders.read', 'Read orders belonging to the staff member''s hostel.'),
  ('orders.verify_payment', 'Approve or reject a submitted payment.'),
  ('orders.read_out_for_delivery', 'Read only orders in the out-for-delivery stage.'),
  ('orders.mark_delivered', 'Advance an order to Delivered.'),
  ('inventory.read', 'Read inventory/stock levels.'),
  ('inventory.write', 'Adjust stock, restock, edit product inventory fields.'),
  ('products.read', 'Read product/category catalogue data as staff.'),
  ('products.write', 'Create, edit, hide, or duplicate products and categories.'),
  ('customers.read', 'Read customer profiles and order history within the hostel.'),
  ('analytics.read', 'Read analytics dashboards and reports.'),
  ('settings.write', 'Edit store settings other than the payment identity.'),
  ('settings.write_payment_identity', 'Edit the hostel''s UPI ID/number/QR.'),
  ('reports.export_financial', 'Export financial reports (CSV/PDF).')
on conflict (action) do nothing;

-- Owner: every permission.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.slug = 'owner'
on conflict do nothing;

-- Manager: everything except the two owner-only permissions (Phase 4 §5).
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.slug = 'manager'
  and p.action not in ('settings.write_payment_identity', 'reports.export_financial')
on conflict do nothing;

-- Inventory Manager: inventory.*, products.* only.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.slug = 'inventory_manager'
  and p.action in ('inventory.read', 'inventory.write', 'products.read', 'products.write')
on conflict do nothing;

-- Delivery Partner: the out-for-delivery lane only (Phase 4 §5, §6).
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.slug = 'delivery_partner'
  and p.action in ('orders.read_out_for_delivery', 'orders.mark_delivered')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- devices — push-notification tokens only, never session storage
-- (Phase 4 §3 Self-Review: Supabase Auth already owns sessions correctly).
-- ---------------------------------------------------------------------------
create type public.device_platform as enum ('web', 'ios', 'android');

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  push_token text not null,
  platform public.device_platform not null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (profile_id, push_token)
);

create index devices_profile_id_idx on public.devices (profile_id);
