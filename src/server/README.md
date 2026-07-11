# server/

- `actions/` — Server Actions, one file per feature, the primary mutation
  path for first-party UI (Phase 4 §8).
- `queries/` — typed server-side read helpers shared between Server
  Components and Server Actions.
- `edge-functions/` — background jobs that must run outside the
  request/response cycle and use the Supabase service-role key (duplicate
  screenshot hashing, notification fan-out, storage lifecycle, nightly
  recommendation recompute — Phase 4 §8, §16).

Populated starting Stage 2 (Authentication) and Stage 3 (Database).
