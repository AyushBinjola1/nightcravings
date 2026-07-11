@AGENTS.md

# NightCravings — engineering constitution

Four documents in [`/docs`](./docs) are approved and final: Product
Foundation, Customer Experience Specification, Owner Console Specification,
Engineering Blueprint. They are the single source of truth. Do not redesign
approved workflows, rewrite architecture, or simplify them away — implement
what they specify. If something here seems to conflict with them, the docs
win; raise it rather than silently deviating.

## Non-negotiables

- No placeholder code, `TODO` comments, or fake data standing in for a real
  API — if a stage isn't built yet, its folder stays empty (with a README
  explaining why) rather than containing something fake.
- No bypassing authentication, Row Level Security, validation, or
  accessibility, ever — including "temporarily, for testing."
- No hardcoded colors, spacing, or typography — everything comes from the
  CSS custom properties in `src/app/globals.css`. No new design tokens
  invented ad hoc; extend `globals.css` deliberately if a real gap exists.
- No `any`, no `console.log`, no dead code, no magic numbers — enforced by
  `npm run lint` / `npm run typecheck`, not just convention.
- No relative parent imports (`../../..`) — use the `@/*` alias.
- No unnecessary dependencies — every package in `package.json` is
  justified in [Phase 4 §2](./docs/phase-4-engineering-blueprint.html#s2).

## Implementation order

Stages are built to completion in order — see
[Phase 4 §24](./docs/phase-4-engineering-blueprint.html#s24). Current stage
is tracked honestly in `src/app/page.tsx` and the root `README.md`. Don't
start Stage N+1 work while Stage N is incomplete, and don't skip ahead to
build a screen from a later stage "since we're here."

## When uncertain

Prefer consistency with the approved docs over novelty. When multiple
implementations are possible, choose the one with better maintainability,
accessibility, performance, and long-term scalability — in that order of
tiebreak after correctness and security, which always come first.
