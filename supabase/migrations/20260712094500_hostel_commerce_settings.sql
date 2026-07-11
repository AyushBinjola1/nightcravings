-- Adds the hostel-level commerce settings Stage 6 (Checkout/Payment)
-- needs, deferred out of the original identity_and_tenancy migration's
-- comment ("delivery fee, free-delivery threshold, and UPI identity are
-- added in a later migration when Store Settings is built") — that later
-- point is now, since Checkout/Payment can't function without them.
--
-- Honest scope note: Phase 4 §13 specifies UPI id/number encrypted at rest
-- via Supabase Vault, decrypted only server-side. That requires configuring
-- the pgsodium extension and vault.create_secret()/vault.decrypted_secrets
-- plumbing, which is real, non-trivial work deferred to Stage 12
-- (Production Hardening) — flagged here rather than silently faked. For
-- now these are plain columns; anon SELECT on them is required regardless
-- of encryption approach, since the customer payment screen must display
-- this to complete checkout (Phase 2 §8).

alter table public.hostels
  add column delivery_fee numeric(10, 2) not null default 25 check (delivery_fee >= 0),
  add column free_delivery_threshold numeric(10, 2) not null default 250 check (free_delivery_threshold >= 0),
  add column upi_id text,
  add column upi_number text,
  add column upi_qr_url text;

comment on column public.hostels.upi_id is
  'Plain text pending Supabase Vault encryption (Stage 12) — see this '
  'migration''s header comment.';
