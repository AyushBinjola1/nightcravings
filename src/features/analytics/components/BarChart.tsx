/**
 * A small, hand-built static bar chart — no charting library, since a
 * 7-point revenue series and a top-5 product list don't need one. Follows
 * the dataviz skill's rules even at this scale: thin marks, rounded
 * data-ends, tabular numerals, and a color drawn from the validated
 * chart CSS tokens in `globals.css` (never the brand accent/night hues —
 * see `design-tokens/colors.ts` for why that combination fails CVD-safety
 * checks). Using the CSS custom property (not a JS hex constant) is what
 * makes the bar recolor correctly between light and dark themes.
 */
"use client";

import { motion } from "framer-motion";

export function BarChart({
  data,
  formatValue = (v) => String(v),
  color = "var(--chart-1)",
}: {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <p className="text-ink-soft text-sm font-semibold">No data yet.</p>;
  }

  return (
    <div className="border-border/60 bg-surface/30 shadow-premium flex flex-col gap-3.5 rounded-3xl border p-6">
      {data.map((d, index) => (
        <div key={d.label} className="flex items-center gap-4">
          <span className="text-ink w-24 shrink-0 truncate text-xs font-semibold sm:text-sm">
            {d.label}
          </span>
          <div className="bg-surface-2/70 relative h-3 flex-1 overflow-hidden rounded-full">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(2, (d.value / max) * 100)}%` }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: index * 0.05,
              }}
              style={{
                backgroundColor: color,
              }}
            />
          </div>
          <span className="text-ink w-18 shrink-0 text-right font-mono text-xs font-bold tabular-nums sm:text-sm">
            {formatValue(d.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
