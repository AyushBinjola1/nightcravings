-- RLS for the tables in 20260711180000_identity_and_tenancy.sql.
--
-- Two helper functions, per Phase 4 §6's Self-Review: hand-written
-- per-table policies are exactly the pattern that produces a "missing
-- check on one table" cross-tenant leak, so every policy below is a
-- one-line call to one of these rather than its own bespoke predicate.
-- Both are SECURITY DEFINER with a pinned search_path so they can read
-- profile_roles/role_permissions regardless of the calling role's own RLS
-- visibility into those tables, without being exploitable via a mutable
-- search_path.

create function public.is_staff_of(target_hostel uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profile_roles pr
    where pr.profile_id = auth.uid()
      and pr.hostel_id = target_hostel
  );
$$;

create function public.has_permission(target_hostel uuid, perm_action text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profile_roles pr
    join public.role_permissions rp on rp.role_id = pr.role_id
    join public.permissions p on p.id = rp.permission_id
    where pr.profile_id = auth.uid()
      and pr.hostel_id = target_hostel
      and p.action = perm_action
  );
$$;

create function public.owns_row(owner_id uuid)
returns boolean
language sql
stable
as $$
  select owner_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- hostels — public read (a customer browses before ever signing in, Phase 2
-- §1), write reserved for the service role until self-serve onboarding
-- exists (Phase 4 §22).
-- ---------------------------------------------------------------------------
alter table public.hostels enable row level security;

create policy hostels_select_public
  on public.hostels for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policy for anon/authenticated: only the service
-- role (which bypasses RLS) can write, matching Phase 4 §6's documented
-- service-role bypass pattern.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy profiles_select_own_or_staff
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or (hostel_id is not null and public.is_staff_of(hostel_id))
  );

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Column-level grant, not just row-level: even on their own row, a client
-- can never write payment_flag_count directly (Phase 4 §3, §6) — only
-- trg_payment_flag_increment (added alongside the payments table in a
-- later migration) can, running as the table owner.
revoke update on public.profiles from authenticated;
grant update (full_name, phone, room_number) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- roles / permissions / role_permissions — reference data. Readable by any
-- signed-in principal (naming a permission action isn't sensitive); writes
-- are a service-role/migration concern only.
-- ---------------------------------------------------------------------------
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

create policy roles_select_authenticated
  on public.roles for select
  to authenticated
  using (true);

create policy permissions_select_authenticated
  on public.permissions for select
  to authenticated
  using (true);

create policy role_permissions_select_authenticated
  on public.role_permissions for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- profile_roles — a staff member sees who holds a role at their own
-- hostel; anyone can see their own assignments. Granting a role is a
-- service-role/owner-console action, not exposed to authenticated writes
-- yet (no UI calls this until Stage 7's Role Management screen exists,
-- Phase 3 §12).
-- ---------------------------------------------------------------------------
alter table public.profile_roles enable row level security;

create policy profile_roles_select_own_or_staff
  on public.profile_roles for select
  to authenticated
  using (profile_id = auth.uid() or public.is_staff_of(hostel_id));

-- ---------------------------------------------------------------------------
-- devices — push tokens, strictly own-row (Phase 4 §3).
-- ---------------------------------------------------------------------------
alter table public.devices enable row level security;

create policy devices_all_own
  on public.devices for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
