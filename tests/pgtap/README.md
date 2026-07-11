# tests/pgtap/

Row Level Security tests — the "hard CI gate" Phase 4 §19 calls for,
verifying the exact invariants claimed throughout this project's commit
history (cross-tenant isolation, role-scoped permissions).

**Not executed in this environment.** `supabase test db` requires either
a local Postgres via Docker (`supabase start`) or `--linked` against a
real project with CLI auth — neither is available here (see README.md's
verification caveat). Both files are syntax-checked against Postgres's
real grammar via `libpg-query`.

Run for real once Docker or a `supabase login` access token exists:

```bash
supabase test db tests/pgtap --linked
# or, with Docker:
supabase start && supabase test db tests/pgtap --local
```

Each file follows Supabase's documented pattern: real rows in a
transaction that's rolled back at the end, `set local role authenticated`
plus a forged `request.jwt.claims` to exercise RLS exactly as PostgREST
would for that user, never a shortcut around the actual policies.
