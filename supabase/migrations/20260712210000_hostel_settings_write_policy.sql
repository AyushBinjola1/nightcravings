-- The original tenancy migration deliberately left `hostels` with no
-- staff write policy at all ("write reserved for the service role
-- until self-serve onboarding exists") — reasonable while there was no
-- Settings screen to use it. There is now (Phase 3 §5): store open/
-- closed status, hours, and delivery fee/threshold are all staff-
-- editable fields with no other write path. Gated by the same
-- `settings.write` permission already seeded for every non-delivery
-- role — this doesn't touch the UPI columns, which stay behind Vault
-- and the separate `settings.write_payment_identity` permission
-- (Stage 12's migration), untouched by this policy.
create policy hostels_update_staff
  on public.hostels for update
  to authenticated
  using (public.has_permission(id, 'settings.write'))
  with check (public.has_permission(id, 'settings.write'));
