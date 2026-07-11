# features/

One folder per product feature (`auth`, `catalogue`, `cart`, `checkout`,
`orders`, `payments`, `inventory`, `customers`, `analytics`). Each feature
owns its own hooks, types, and presentational components, and exposes its
public surface through an `index.ts` barrel — other features never
deep-import across feature boundaries (Phase 4 §20-21).

`auth` is populated starting Stage 2 (Authentication) since sign-in has to
exist before the screens that depend on a session do. Everything else is
populated starting Stage 6 (Customer Application) and Stage 7 (Owner
Console) of the implementation roadmap (Phase 4 §24) — empty until then by
design, not by omission.
