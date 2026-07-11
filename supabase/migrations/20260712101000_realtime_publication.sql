-- Phase 4 §10 — tables must be explicitly added to Supabase's realtime
-- publication before postgres_changes subscriptions receive anything;
-- it isn't automatic just because RLS allows a SELECT. `orders` is added
-- now for the Stage 6 tracking page and the Stage 7 Order Queue; more
-- tables join this publication as later stages need live updates
-- (Phase 4 §10's per-hostel channel scoping is enforced client-side via
-- the `filter` passed to `.on('postgres_changes', ...)`, not by this
-- publication membership itself).
alter publication supabase_realtime add table public.orders;
