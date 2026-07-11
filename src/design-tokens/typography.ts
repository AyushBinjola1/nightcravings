/**
 * Approved typography tokens — Phase 1 §10.
 *
 * Serif display face (signage character) + system sans for functional UI +
 * system mono for tabular numerals and code. No webfont is loaded: every
 * face here resolves from the OS font stack, so there is zero font-loading
 * cost and zero risk of a CDN-blocked silent fallback.
 */
export const fontFamily = {
  display: [
    "Charter",
    "Iowan Old Style",
    "Palatino Linotype",
    "Georgia",
    "serif",
  ],
  body: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "system-ui",
    "sans-serif",
  ],
  mono: [
    "ui-monospace",
    "SFMono-Regular",
    "Consolas",
    "Liberation Mono",
    "monospace",
  ],
} as const;

/** Type scale — ~1.25 ratio, five steps (Phase 1 §10). */
export const fontSize = {
  display: "2.2rem",
  heading: "1.5rem",
  subheading: "1.15rem",
  body: "1rem",
  caption: "0.8rem",
} as const;
