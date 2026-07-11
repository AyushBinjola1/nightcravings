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
    return <p className="text-ink-soft text-sm">No data yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-ink-soft w-24 shrink-0 truncate text-xs">
            {d.label}
          </span>
          <div className="bg-surface-2 h-2.5 flex-1 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(2, (d.value / max) * 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <span className="text-ink w-16 shrink-0 text-right font-mono text-xs tabular-nums">
            {formatValue(d.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
