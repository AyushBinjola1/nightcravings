# NightCravings

The premium late-night convenience store inside every hostel. This repo
implements the product specified in [`/docs`](./docs) — four approved,
final documents that are the single source of truth for design and
architecture decisions. Read them before changing product behavior.

## Build status

**Stage 3 of 12 (Database) — complete, with one honest caveat below.** See
the implementation order in
[Phase 4 §24](./docs/phase-4-engineering-blueprint.html#s24) for what's next
(Stage 4: Design System). Each stage is built to completion before the next
begins — nothing here is a shortcut or a placeholder for a later stage.

**Customer identity is browser-local only, by product direction, not Phase
4 §4 as originally written.** There is no customer sign-in of any kind —
no OTP, no account. `src/stores/customer-profile.ts` saves name/phone/room
to this browser's `localStorage` so Checkout can prefill it on a return
visit; that's the entire scope. Only staff (owner/manager/inventory
manager/delivery partner) authenticate, via email/password, protected by
`src/proxy.ts` (redirects a signed-out visitor from any Owner Console route
to `/login`, and a signed-in one away from it). Without Supabase
configured, the app still runs — every request is treated as signed out
rather than crashing (`src/lib/supabase/middleware.ts`).

A real Supabase project is now connected (`.env.local`, not committed).
`supabase/migrations/` has four files, in order:

1. `20260711180000_identity_and_tenancy.sql` — `hostels`, `profiles` (staff
   only now), RBAC (`roles`/`permissions`/`role_permissions`/`profile_roles`),
   `devices`.
2. `20260711180100_identity_and_tenancy_rls.sql` — RLS for the above, built
   on two shared helper functions (`is_staff_of`, `has_permission`) per
   Phase 4 §6's Self-Review, not hand-written per-table policies.
3. `20260712090000_catalogue_orders_payments.sql` — `categories`,
   `products`, `stock_history`, `customers`, `orders`, `order_items`,
   `payments`, `payment_screenshots`, plus RLS and a `get_order_tracking()`
   RPC. Adapted for the no-customer-auth decision above: `customers` is a
   plain phone-keyed table (no `auth.users`), orders snapshot
   name/phone/room directly, and post-checkout order tracking is a
   capability-URL pattern (the order's UUID is the credential) rather than
   `auth.uid()` ownership — documented in the migration's header as a
   deliberate, stated tradeoff, not an oversight.
4. `20260712091500_storage_buckets.sql` — `product-images`,
   `category-images`, `payment-screenshots` buckets with matching
   `storage.objects` RLS.

**Verification caveat, stated plainly:** this sandbox has no Docker (so
`supabase start` can't run a local Postgres) and only a publishable key for
the linked project — no personal access token or DB password to run
`supabase db push` from here. All four migration files are syntax-checked
against Postgres's real grammar (via `libpg-query` — every statement in
every file parses clean) and staff sign-in works against the real project's
Auth service, but **the migrations themselves have not been applied yet.**
Fastest unblock, no extra credentials needed: paste the four files' contents
into the linked project's SQL Editor, in the numbered order above, and run
them. Then regenerate `src/types/database.ts` for real via
`supabase gen types typescript --project-id qwziuxkcbzrygmozqrad`.

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · Supabase
(Postgres, Auth, Storage, Realtime) · Zustand · TanStack Query · React Hook
Form + Zod · Framer Motion · Lucide. Every choice is justified in
[Phase 4 §2](./docs/phase-4-engineering-blueprint.html#s2).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase project keys — see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Until a Supabase
project exists (Stage 3), the app runs and renders, but nothing that reads
or writes data will work — that's expected at this stage.

### Environment variables

Copy `.env.example` to `.env.local` and fill in a Supabase project's URL and
anon key at minimum. Never commit `.env.local`. The service-role key is
server-only and must never be referenced from a Client Component — see
[Phase 4 §13](./docs/phase-4-engineering-blueprint.html#s13).

## Scripts

| Command                           | Purpose                                                               |
| --------------------------------- | --------------------------------------------------------------------- |
| `npm run dev`                     | Start the local dev server                                            |
| `npm run build`                   | Production build                                                      |
| `npm run lint`                    | ESLint (strict — no `any`, no `console.log`, exhaustive switches)     |
| `npm run typecheck`               | `tsc --noEmit` against the strict compiler options in `tsconfig.json` |
| `npm run format` / `format:check` | Prettier, with the Tailwind class-sorting plugin                      |

A pre-commit hook (Husky + lint-staged) runs lint, format, and typecheck on
every commit — see `.husky/pre-commit`.

## Project structure

Mirrors [Phase 4 §20](./docs/phase-4-engineering-blueprint.html#s20)
exactly:

```
src/
├── app/                 # Next.js App Router — route groups per Phase 4 §20
├── features/            # one folder per product feature
├── components/ui/       # themed shadcn/ui primitives
├── design-tokens/       # chart-only color tokens (brand tokens live in globals.css)
├── server/               # Server Actions, queries, Edge Functions
├── lib/                  # Supabase clients, Zod schemas, RLS helper mirrors
├── hooks/ stores/ types/ config/
└── ../tests/             # unit, integration, e2e, pgtap
```

Each not-yet-populated folder carries its own `README.md` explaining what
belongs there and which implementation stage fills it in.

## Design system

Every color, font, and radius is a CSS custom property in
`src/app/globals.css`, mapped to Tailwind utilities via `@theme inline` —
`bg-surface`, `text-ink-soft`, `border-border`, `font-display`, etc. Light
and dark are both first-class (see Phase 1 §9); never hardcode a hex value
or a one-off spacing number in a component.

## Known dependency advisory

`npm audit` reports one moderate advisory (PostCSS XSS in stringify output)
nested inside Next.js's own toolchain. It affects build-time CSS
stringification, not runtime request handling, and fixing it today requires
downgrading Next.js by several major versions. Tracked, not ignored —
revisit when Next.js ships a patched transitive dependency.
