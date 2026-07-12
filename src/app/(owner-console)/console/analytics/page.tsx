import type { Metadata } from "next";

import { BackLink } from "@/components/ui/back-link";
import { AnalyticsRealtimeRefresher, BarChart } from "@/features/analytics";
import { getCurrentHostel } from "@/server/queries/catalogue";
import { getRevenueByDay, getTopProducts } from "@/server/queries/analytics";

export const metadata: Metadata = {
  title: "Analytics — NightCravings Owner Console",
};

/**
 * Phase 3 §7 — a modest, real first pass: revenue by day and top
 * products, both from actual aggregation RPCs (Stage 9's migration), not
 * placeholder numbers. Peak-hours heatmap, retention, and margin
 * breakdowns need more order history than a fresh deployment has —
 * deferred rather than shown with fabricated data.
 */
export default async function AnalyticsPage() {
  const hostel = await getCurrentHostel();

  if (!hostel) {
    return (
      <main className="text-ink-soft mx-auto max-w-xl px-6 py-16 text-center text-sm">
        Store not found — apply the Stage 3 migrations first (see README.md).
      </main>
    );
  }

  const [revenue, topProducts] = await Promise.all([
    getRevenueByDay(hostel.id, 7),
    getTopProducts(hostel.id, 5),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <BackLink href="/console/dashboard" label="Dashboard" />
      <AnalyticsRealtimeRefresher hostelId={hostel.id} />
      <h1 className="font-display text-ink mb-6 text-xl font-semibold">
        Analytics
      </h1>

      <section className="mb-8">
        <h2 className="text-ink mb-3 text-sm font-medium">
          Revenue — last 7 days
        </h2>
        <BarChart
          data={revenue.map((r) => ({
            label: new Date(r.day).toLocaleDateString("en-IN", {
              weekday: "short",
            }),
            value: r.revenue,
          }))}
          formatValue={(v) => `₹${v.toFixed(0)}`}
        />
      </section>

      <section>
        <h2 className="text-ink mb-3 text-sm font-medium">Top products</h2>
        <BarChart
          data={topProducts.map((p) => ({
            label: p.productName,
            value: p.totalQuantity,
          }))}
          color="var(--chart-2)"
        />
      </section>
    </main>
  );
}
