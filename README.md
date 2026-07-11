# NightCravings

The premium late-night convenience store inside every hostel. This repo
implements the product specified in [`/docs`](./docs) — four approved,
final documents that are the single source of truth for design and
architecture decisions. Read them before changing product behavior.

## Build status

**Stage 7 of 12 complete** (Project Setup, Authentication, Database,
Design System, Shared Components, Customer Application, Owner Console).
See the implementation order in
[Phase 4 §24](./docs/phase-4-engineering-blueprint.html#s24) for what's
next (Stage 8: Realtime hardening, Stage 9: Analytics, Stage 10: PWA,
Stage 11: Testing, Stage 12: Production Hardening). Realtime itself is
already live in Stages 6-7 (order tracking, the Order Queue) — Stage 8 is
about extending that pattern further (Dashboard tiles, inventory), not
introducing it for the first time.

**What actually works right now**, against the real linked Supabase
project, once the migrations below are applied:

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

A real Supabase project is connected (`.env.local`, not committed).
`supabase/migrations/` has nine files, in order — apply them in the linked
project's SQL Editor in this order (see the verification caveat below for
why that's the fastest path):

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
   `delivery_fee`/`free_delivery_threshold`/UPI fields to `hostels`. UPI
   fields are plain text pending Supabase Vault encryption (Phase 4 §13),
   explicitly deferred to Stage 12 — noted in the file, not silently
   skipped.
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

**Verification caveat, stated plainly:** this sandbox has no Docker (so
`supabase start` can't run a local Postgres) and only a publishable key for
the linked project — no personal access token or DB password to run
`supabase db push` from here. Every migration file is syntax-checked
against Postgres's real grammar (via `libpg-query`) and staff sign-in works
against the real project's Auth service, but **the migrations themselves
have not been applied yet, and the full customer/owner flow above is
therefore unverified against real data.** Fastest unblock, no extra
credentials needed: paste the nine files' contents into the SQL Editor, in
the numbered order above, then regenerate `src/types/database.ts` for real
via `supabase gen types typescript --project-id qwziuxkcbzrygmozqrad`.

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

Open [http://localhost:3000](http://localhost:3000). Until the migrations
above are applied, the app runs and every screen renders its honest empty
state ("Store not found") rather than crashing.

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

## Known dependency advisory

`npm audit` reports one moderate advisory (PostCSS XSS in stringify output)
nested inside Next.js's own toolchain. It affects build-time CSS
stringification, not runtime request handling, and fixing it today requires
downgrading Next.js by several major versions. Tracked, not ignored —
revisit when Next.js ships a patched transitive dependency.
