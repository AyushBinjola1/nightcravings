# features/

One folder per product feature (`catalogue`, `cart`, `checkout`, `orders`,
`payments`, `inventory`, `customers`, `analytics`). Each feature owns its own
hooks, types, and presentational components, and exposes its public surface
through an `index.ts` barrel — other features never deep-import across
feature boundaries (Phase 4 §20-21).

Populated starting Stage 6 (Customer Application) and Stage 7 (Owner
Console) of the implementation roadmap (Phase 4 §24). Empty until then by
design, not by omission.
