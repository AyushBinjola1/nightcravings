# features/

One folder per product feature — `auth`, `catalogue`, `cart`, `checkout`,
`payment`, `orders`, `order-queue` are built; `inventory`, `customers`,
`analytics` remain for a later pass of the Owner Console. Each feature
owns its own hooks, types, and presentational components, and exposes its
public surface through an `index.ts` barrel — other features never
deep-import across feature boundaries (Phase 4 §20-21).

- `auth` — local-only customer profile form + staff email/password sign-in.
- `catalogue` — Home's status bar, category tiles, product grid, and the
  product detail sheet.
- `cart` — the persistent cart bar/sheet.
- `checkout` — the no-login checkout form.
- `payment` — the UPI QR/copy/screenshot-upload screen.
- `orders` — the customer-facing realtime order tracker.
- `order-queue` — the Owner Console's three-lane Order Queue.
