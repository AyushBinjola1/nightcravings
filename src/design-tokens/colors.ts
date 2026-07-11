/**
 * Chart-only color tokens — Phase 3 §7, Phase 4 §15.
 *
 * Brand UI colors (ink, paper, accent, night, …) live as CSS custom
 * properties in `src/app/globals.css` and are consumed through Tailwind's
 * `@theme` mapping — that file is their single source of truth, since
 * Tailwind v4 reads theme values from CSS, not from a JS config object.
 * Duplicating those hex values here would create exactly the drift risk our
 * coding standards forbid.
 *
 * This file exists only for the one case that genuinely needs a raw JS
 * value: canvas/SVG chart rendering, where a series color can't be a
 * Tailwind class. These values are validated separately from the brand
 * palette for color-vision-deficiency safety — never substitute the brand
 * `accent`/`night` colors into a categorical chart series (see the dataviz
 * skill's `references/palette.md` for why that combination fails the
 * CVD-separation check).
 */
export const chartColors = {
  light: {
    series: [
      "#2a78d6",
      "#1baf7a",
      "#eda100",
      "#008300",
      "#4a3aa7",
      "#e34948",
      "#e87ba4",
      "#eb6834",
    ],
    good: "#0ca30c",
    warning: "#fab219",
    serious: "#ec835a",
    critical: "#d03b3b",
  },
  dark: {
    series: [
      "#3987e5",
      "#199e70",
      "#c98500",
      "#008300",
      "#9085e9",
      "#e66767",
      "#d55181",
      "#d95926",
    ],
    good: "#0ca30c",
    warning: "#fab219",
    serious: "#ec835a",
    critical: "#d03b3b",
  },
} as const;

export type ChartSeriesColor = (typeof chartColors.light.series)[number];
