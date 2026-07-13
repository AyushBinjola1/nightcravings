import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBag,
  BarChart3,
  MenuSquare,
  Settings,
  Sparkles,
  ArrowRight,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  DashboardRealtimeRefresher,
  DashboardTiles,
} from "@/features/dashboard";
import { getCurrentHostel } from "@/server/queries/catalogue";
import { getDashboardStats } from "@/server/queries/dashboard";

export const metadata: Metadata = {
  title: "Dashboard — NightCravings Owner Console",
};

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
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      {/* Top Banner section */}
      <div className="border-border/40 mb-8 flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div>
          <div className="text-night mb-1.5 flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
            <Sparkles size={12} className="animate-pulse" /> Owner Command
            Center
          </div>
          <h1 className="font-display text-ink text-2xl font-extrabold tracking-tight md:text-3xl">
            Welcome back, {user?.email?.split("@")[0]}
          </h1>
          <p className="text-ink-soft mt-1 flex items-center gap-1.5 text-xs font-medium">
            <span className="bg-success inline-block h-2 w-2 rounded-full" />
            Connected to {hostel?.name ?? "Hostel Store"}
          </p>
        </div>

        {/* Store state summary */}
        {hostel && (
          <div className="bg-surface/50 border-border/40 flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm">
            <div className="bg-success/10 text-success rounded-xl p-2">
              <UserCheck size={16} />
            </div>
            <div>
              <span className="text-ink-soft block text-[10px] font-bold tracking-wider uppercase">
                Store Status
              </span>
              <span className="text-ink mt-0.5 flex items-center gap-1 text-xs font-bold">
                {hostel.status === "open"
                  ? "🟢 Accepting Orders"
                  : "🔴 Store Closed"}
              </span>
            </div>
          </div>
        )}
      </div>

      {hostel ? (
        <div className="flex flex-col gap-8">
          <DashboardTiles stats={stats} />
          <DashboardRealtimeRefresher hostelId={hostel.id} />

          {/* Quick Actions grid */}
          <div className="flex flex-col gap-4">
            <h2 className="text-ink-soft text-xs font-bold tracking-wider uppercase">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <QuickActionCard
                href="/console/orders"
                label="Order Queue"
                description="Manage live orders"
                icon={ShoppingBag}
                badge={
                  stats.pendingOrders > 0
                    ? `${stats.pendingOrders} pending`
                    : undefined
                }
              />
              <QuickActionCard
                href="/console/analytics"
                label="Analytics"
                description="View revenue graphs"
                icon={BarChart3}
              />
              <QuickActionCard
                href="/console/products"
                label="Manage Menu"
                description="Edit prices & items"
                icon={MenuSquare}
              />
              <QuickActionCard
                href="/console/settings"
                label="Store Settings"
                description="Change delivery rates"
                icon={Settings}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface/50 border-border/60 shadow-premium rounded-3xl border p-8 text-center">
          <p className="text-ink mb-2 text-base font-semibold">
            Store not found
          </p>
          <p className="text-ink-soft mx-auto max-w-sm text-sm">
            Please apply the Stage 3 migrations first (see README.md) to set up
            your demo hostel and seed catalogue data.
          </p>
        </div>
      )}
    </div>
  );
}

function QuickActionCard({
  href,
  label,
  description,
  icon: Icon,
  badge,
}: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group border-border/60 bg-surface/30 hover:bg-surface/60 hover:border-night/20 hover:shadow-premium relative flex h-36 flex-col justify-between rounded-2xl border p-5 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="bg-surface-2 text-ink-soft group-hover:text-night group-hover:bg-night/10 rounded-xl p-2.5 transition-colors">
          <Icon size={18} />
        </div>
        {badge && (
          <span className="animate-pulse rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-500 uppercase">
            {badge}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-ink group-hover:text-night flex items-center gap-1 text-sm font-bold transition-colors">
          {label}{" "}
          <ArrowRight
            size={12}
            className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
          />
        </h3>
        <p className="text-ink-soft mt-0.5 text-xs leading-tight">
          {description}
        </p>
      </div>
    </Link>
  );
}
