# stores/

Zustand stores for client-only state (Phase 4 §11) — cart contents, UI
toggles, and the customer's local profile. Anything that also lives on the
server belongs in a TanStack Query hook instead, never duplicated here.

`customer-profile.ts` is the one store persisted to `localStorage`
(Zustand's `persist` middleware) rather than kept in memory — see the file
for why customer identity is browser-local only, with no server-side
account behind it.
