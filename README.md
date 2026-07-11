# NightCravings

The premium late-night convenience store inside every hostel. This repo
implements the product specified in [`/docs`](./docs) — four approved,
final documents that are the single source of truth for design and
architecture decisions. Read them before changing product behavior.

## Build status

**All 12 stages complete.** See the implementation order in
[Phase 4 §24](./docs/phase-4-engineering-blueprint.html#s24).

**All 13 migrations are applied to the live linked Supabase project** (via
`supabase db push`, a real access token, and `supabase gen types` — see
the note at the end of this section). `npm run dev` now shows a real,
stocked Home page — the demo hostel and its 9 seeded products — not an
empty state. **What actually works right now**, verified against that
live data:

- Customer: browse the catalogue (Home), open a product detail sheet, add
  to cart, checkout with no login (name/phone/room only,
  browser-`localStorage`-remembered), pay via UPI QR/ID/number with
  copy-to-clipboard, upload a payment screenshot, track the order live
  (Supabase Realtime) through Payment Submitted → Order Confirmed →
  Delivery Coming → Delivered.
- Staff: sign in at `/console/login` (email/password), see a live
  three-lane Order Queue at `/console/orders` (Awaiting Verification →
  Preparing → Out for Delivery), approve/reject a payment inline, advance
  an order's stage — all realtime-subscribed across devices.

**Customer identity is browser-local only, by product direction, not Phase
4 §4 as originally written.** There is no customer sign-in of any kind —
no OTP, no account. `src/stores/customer-profile.ts` saves name/phone/room
to this browser's `localStorage` so Checkout can prefill it on a return
visit. Only staff authenticate, via email/password, protected by
`src/proxy.ts` — every Owner Console screen lives under `/console/*`
specifically (not bare `/orders`, `/dashboard`, etc.) because the original
bare paths collided with the customer-facing `/orders/[orderId]` tracking
route; caught and fixed while building Stage 6.

### Database

A real Supabase project is connected (`.env.local`, not committed) and
**all thirteen migrations below are applied to it** — run in order via
`supabase db push` once a personal access token was provided:

1. `20260711180000_identity_and_tenancy.sql` — `hostels`, `profiles` (staff
   only), RBAC, `devices`.
2. `20260711180100_identity_and_tenancy_rls.sql` — RLS via two shared
   helpers (`is_staff_of`, `has_permission`), per Phase 4 §6's Self-Review.
3. `20260712090000_catalogue_orders_payments.sql` — `categories`,
   `products`, `stock_history`, `customers`, `orders`, `order_items`,
   `payments`, `payment_screenshots` + RLS + `get_order_tracking()`.
   `customers` is phone-keyed, no `auth.users` link; post-checkout
   tracking is a capability-URL pattern (the order UUID is the
   credential) — a stated tradeoff, documented in the migration header.
4. `20260712091500_storage_buckets.sql` — `product-images`,
   `category-images`, `payment-screenshots` buckets + `storage.objects`
   RLS.
5. `20260712093000_seed_demo_hostel.sql` — seeds one browsable hostel
   (`demo-hostel`) so Stage 6 has something to render immediately.
6. `20260712094500_hostel_commerce_settings.sql` — adds
   `delivery_fee`/`free_delivery_threshold`/UPI fields to `hostels`.
7. `20260712095500_checkout_flow_fixes.sql` — three bugs caught while
   actually building Checkout: orders could only be placed while the
   store was open (contradicted Phase 2 §11); `customers` had no anon
   write policy at all; `increment_payment_flag_count` wasn't
   `SECURITY DEFINER` so it couldn't actually write the column it exists
   to protect. Also adds `get_payment_for_order()`.
8. `20260712100000_submit_transaction_id_rpc.sql` — a narrow
   `SECURITY DEFINER` RPC so a customer can attach an optional UPI
   transaction ID without any broader anon UPDATE grant on `payments`.
9. `20260712101000_realtime_publication.sql` +
   `20260712102000_orders_update_policy_fix.sql` — adds `orders` to
   Supabase's realtime publication, and fixes `orders_update_staff` (the
   original policy only checked `orders.read`, which excluded the
   delivery_partner role from ever marking an order Delivered).
10. `20260712110000_analytics_rpcs.sql` — `get_revenue_by_day()` /
    `get_top_products()`, plain (non-`SECURITY DEFINER`) functions that
    rely on the existing staff RLS rather than opening a new access path.
11. `20260712120000_vault_encrypt_upi.sql` — Stage 12: replaces the plain
    `upi_id`/`upi_number` columns from migration 6 with Supabase Vault
    (pgsodium) encrypted secrets, accessed only through
    `set_hostel_upi_details()` (staff-only writer) and
    `get_hostel_payment_info()` (the anon-readable decrypting getter) —
    fulfills the deferral stated in migration 6's own header.
12. `20260712130000_seed_demo_catalogue.sql` — seeds four categories and
    nine real products (Maggi, chips, cold drinks, chocolates, etc. at
    realistic prices) for `demo-hostel`, so Home shows an actual shelf
    immediately rather than an empty state. Idempotent — skips itself if
    the hostel already has any category.

**Verification status:** all thirteen migrations were applied for real via
`supabase link --project-ref qwziuxkcbzrygmozqrad` + `supabase db push`
(this sandbox still has no Docker, so `supabase start`/local dev remain
unavailable — but a real personal access token made `--linked` operation
possible). Confirmed directly against the live REST API afterward (the
seeded hostel and all 9 products round-tripped correctly), and
`src/types/database.ts` was regenerated for real via
`supabase gen types typescript --project-id qwziuxkcbzrygmozqrad` —
replacing the hand-authored stand-in with actual generated output, which
typechecked clean on the first try against every query already written
against the hand-authored version. All 18 unit tests and all 7 e2e tests
(the latter against a real Chromium browser and a real production build)
pass against this live data.

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · Supabase
(Postgres, Auth, Storage, Realtime) · Zustand · TanStack Query · React Hook
Form + Zod · Framer Motion · Lucide · Radix (Dialog, Label, Slot). Every
choice is justified in
[Phase 4 §2](./docs/phase-4-engineering-blueprint.html#s2).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase project keys — see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the migrations are
applied, so this shows the real demo hostel and its seeded catalogue, not
an empty state. If you ever point this at a fresh, unmigrated Supabase
project, every screen still degrades to an honest empty state ("Store not
found") rather than crashing — that resilience is unit/e2e-tested, not
just asserted.

### Environment variables

Copy `.env.example` to `.env.local` and fill in a Supabase project's URL
and publishable key at minimum, plus `NEXT_PUBLIC_HOSTEL_SLUG` (defaults to
`demo-hostel`, matching the seed migration). Never commit `.env.local`. The
secret key is server-only and must never be referenced from a Client
Component — see [Phase 4 §13](./docs/phase-4-engineering-blueprint.html#s13).

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

Mirrors [Phase 4 §20](./docs/phase-4-engineering-blueprint.html#s20):

```
src/
├── app/
│   ├── (storefront)/         # Home, checkout, payment/[orderId], orders/[orderId]
│   └── (owner-console)/      # everything under /console — login, dashboard, orders
├── features/                 # auth, catalogue, cart, checkout, payment, orders, order-queue
├── components/ui/            # Button, Input, Field, Badge, Card, Skeleton, Sheet, Toaster
├── design-tokens/             # chart-only color tokens (brand tokens live in globals.css)
├── server/
│   ├── actions/                # auth, checkout, payment, order-queue
│   └── queries/                # catalogue, payment, tracking, order-queue
├── lib/                        # Supabase clients, Zod schemas, cn(), rate-limit, result
├── stores/                     # cart, customer-profile, toast (Zustand)
└── config/                     # hostel.ts — the single-hostel slug config
```

Each not-yet-populated folder (`hooks/`, most of `types/`) carries its own
`README.md` explaining what belongs there and which stage fills it in.

## Design system

Every color, font, and radius is a CSS custom property in
`src/app/globals.css`, mapped to Tailwind utilities via `@theme inline` —
`bg-surface`, `text-ink-soft`, `border-border`, `font-display`, etc. Light
and dark are both first-class (see Phase 1 §9); never hardcode a hex value
or a one-off spacing number in a component.

## Testing

Three layers, per Phase 4 §19 — status of each stated plainly:

| Layer | Tool                            | Status                                                                                                                                                                                                                                                                                                  |
| ----- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit  | Vitest (`npm run test`)         | **18/18 passing.** Cart math, Zod schema edge cases, `ActionResult` discrimination, a `BarChart` render test. One of these (the room-number/pickup case) caught a real validation bug before it ever reached checkout — see `tests/unit/zod-schemas.test.ts`.                                           |
| E2e   | Playwright (`npm run test:e2e`) | **7/7 passing**, run against a real production build in a real Chromium browser. Confirms the app shell, checkout empty state, both PWA manifest links, and the full staff-login redirect chain all work — including the app's graceful "table not found" handling with the migrations still unapplied. |
| RLS   | pgTAP (`tests/pgtap/`)          | **Written, syntax-verified, not executed** — needs Docker or a `supabase login` token, neither available here. See `tests/pgtap/README.md` for the exact command to run them for real.                                                                                                                  |

## Production hardening (Stage 12)

- **Security headers** — CSP (`connect-src` scoped to exactly Supabase +
  PostHog + Sentry, no wildcard), HSTS, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`
  — all applied globally in `next.config.ts`, manually verified with
  `curl -D -` against a real production build.
- **Rate limiting** extended past staff login (Stage 2) to `placeOrder`
  (10 orders/phone/hour) and `submitPaymentProof` (15 attempts/order/hour)
  — same Upstash-backed, fail-open-when-unconfigured helper as before.
- **Sentry** — `src/instrumentation.ts` (server + edge) and
  `src/instrumentation-client.ts`, both gated on `NEXT_PUBLIC_SENTRY_DSN`
  being set. Deliberately not wrapped with `withSentryConfig` in
  `next.config.ts` — that plugin uploads source maps at build time and
  needs a `SENTRY_AUTH_TOKEN` this environment doesn't have; add it once a
  real Sentry project exists rather than risk the build silently skipping
  (or failing) source-map upload.
- **UPI encryption** — migration 11 moves `upi_id`/`upi_number` off plain
  columns and into Supabase Vault (pgsodium), read only through a
  decrypting RPC. Fulfills the deferral called out in migration 6.

## Known dependency advisory

`npm audit` reports one moderate advisory (PostCSS XSS in stringify output)
nested inside Next.js's own toolchain. It affects build-time CSS
stringification, not runtime request handling, and fixing it today requires
downgrading Next.js by several major versions. Tracked, not ignored —
revisit when Next.js ships a patched transitive dependency.
