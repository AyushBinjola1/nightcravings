import { Card } from "@/components/ui/card";
import type { DashboardStats } from "@/server/queries/dashboard";

/**
 * Phase 3 §1 — every tile maps to one of the Foundation Doc's success
 * metrics; nothing here is decorative. Pending is the one tile styled to
 * visibly nag (Phase 3 §1) since it's the tile with an action attached.
 */
export function DashboardTiles({ stats }: { stats: DashboardStats }) {
  const tiles: { label: string; value: string; warn?: boolean }[] = [
    { label: "Today's Sales", value: `₹${stats.todaysSales.toFixed(0)}` },
    { label: "Today's Orders", value: String(stats.todaysOrders) },
    {
      label: "Pending",
      value: String(stats.pendingOrders),
      warn: stats.pendingOrders > 0,
    },
    { label: "Completed", value: String(stats.completedOrders) },
    { label: "Cancelled", value: String(stats.cancelledOrders) },
    {
      label: "Avg Order Value",
      value: `₹${stats.averageOrderValue.toFixed(0)}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <Card key={tile.label} className="p-4">
          <div className="text-ink-soft font-mono text-[10px] tracking-wide uppercase">
            {tile.label}
          </div>
          <div
            className={`font-display mt-1 text-2xl font-semibold tabular-nums ${
              tile.warn ? "text-warning" : "text-ink"
            }`}
          >
            {tile.value}
          </div>
        </Card>
      ))}
    </div>
  );
}
