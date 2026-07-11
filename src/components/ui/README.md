# components/ui/

Hand-built primitives in the shadcn/ui style — Radix underneath for
accessibility mechanics (focus trap, ARIA, keyboard), `class-variance-authority`
for variants, themed exclusively through the CSS custom properties in
`src/app/globals.css` — never a hardcoded color, spacing, or radius value
(Phase 1 §7, Phase 4's design-system rules).

| Component      | Backing                                     | Notes                                                           |
| -------------- | ------------------------------------------- | --------------------------------------------------------------- |
| `button.tsx`   | Radix Slot (`asChild`)                      | primary/secondary/ghost/danger × sm/md/lg (Phase 1 §8)          |
| `input.tsx`    | plain `<input>`                             | themed border/focus state, `aria-invalid` styling               |
| `label.tsx`    | Radix Label                                 |                                                                 |
| `field.tsx`    | composes Label + Input + error              | every form field in the app goes through this                   |
| `badge.tsx`    | plain `<span>`                              | status pills — color always paired with text, never alone       |
| `card.tsx`     | plain `<div>`                               |                                                                 |
| `skeleton.tsx` | plain `<div>`                               | pulse, not shimmer — see Phase 2 §12/§15                        |
| `sheet.tsx`    | Radix Dialog + Framer Motion                | the Product Detail / Cart bottom-sheet primitive (Phase 2 §5-6) |
| `toaster.tsx`  | Zustand (`stores/toast.ts`) + Framer Motion | mounted once in `app/providers.tsx`                             |

Populated in Stage 4 (Design System); adopted immediately by the Stage 2
auth forms so there is one component per concern, not two.
