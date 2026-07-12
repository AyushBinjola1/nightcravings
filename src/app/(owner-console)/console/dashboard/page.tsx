import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import {
  DashboardRealtimeRefresher,
  DashboardTiles,
} from "@/features/dashboard";
import { getCurrentHostel } from "@/server/queries/catalogue";
import { getDashboardStats } from "@/server/queries/dashboard";

export const metadata: Metadata = {
  title: "Dashboard — NightCravings Owner Console",
};

/**
 * Phase 3 §1 — real tiles from real queries, realtime-subscribed (Phase 4
 * §10) so a new order updates Pending without a manual refresh. Low-stock
 * list and the revenue sparkline need Inventory/Analytics (later passes)
 * to have real data to show — not built here rather than faked.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hostel = await getCurrentHostel();
  const stats = hostel
    ? await getDashboardStats(hostel.id)
    : {
        todaysSales: 0,
        todaysOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0,
      };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-accent mb-3 font-mono text-xs tracking-[0.1em] uppercase">
        NightCravings — Owner Console
      </p>
      <h1 className="font-display text-ink mb-6 text-2xl font-semibold text-balance">
        Signed in as {user?.email}.
      </h1>

      {hostel ? (
        <>
          <DashboardTiles stats={stats} />
          <DashboardRealtimeRefresher hostelId={hostel.id} />
        </>
      ) : (
        <p className="text-ink-soft mb-6 text-sm">
          Store not found — apply the Stage 3 migrations first (see README.md).
        </p>
      )}

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/console/orders"
          className="bg-accent text-paper rounded-md px-4 py-2.5 text-sm font-medium"
        >
          Open Order Queue
        </Link>
        <Link
          href="/console/analytics"
          className="border-border text-ink rounded-md border px-4 py-2.5 text-sm font-medium"
        >
          Analytics
        </Link>
        <Link
          href="/console/products"
          className="border-border text-ink rounded-md border px-4 py-2.5 text-sm font-medium"
        >
          Manage Menu
        </Link>
        <SignOutButton />
      </div>
    </main>
  );
}
