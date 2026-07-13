"use client";

import { motion } from "framer-motion";
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardStats } from "@/server/queries/dashboard";

export function DashboardTiles({ stats }: { stats: DashboardStats }) {
  const tiles = [
    {
      label: "Today's Sales",
      value: `₹${stats.todaysSales.toFixed(0)}`,
      icon: IndianRupee,
      color: "text-emerald-500 bg-emerald-500/10",
      description: "Gross revenue generated today",
    },
    {
      label: "Today's Orders",
      value: String(stats.todaysOrders),
      icon: ShoppingBag,
      color: "text-blue-500 bg-blue-500/10",
      description: "Total orders placed today",
    },
    {
      label: "Pending Verification",
      value: String(stats.pendingOrders),
      warn: stats.pendingOrders > 0,
      icon: Clock,
      color:
        stats.pendingOrders > 0
          ? "text-amber-500 bg-amber-500/10 animate-pulse"
          : "text-ink-soft bg-surface-2",
      description: "Awaiting payment check",
    },
    {
      label: "Completed Orders",
      value: String(stats.completedOrders),
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-500/10",
      description: "Delivered to rooms/picked up",
    },
    {
      label: "Cancelled Orders",
      value: String(stats.cancelledOrders),
      icon: XCircle,
      color: "text-rose-500 bg-rose-500/10",
      description: "Declined or user cancelled",
    },
    {
      label: "Avg Order Value",
      value: `₹${stats.averageOrderValue.toFixed(0)}`,
      icon: TrendingUp,
      color: "text-purple-500 bg-purple-500/10",
      description: "Average spending per order",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {tiles.map((tile, index) => {
        const Icon = tile.icon;
        return (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 25,
              delay: index * 0.05,
            }}
            whileHover={{ y: -3, scale: 1.01 }}
            className="flex"
          >
            <Card className="border-border/60 hover:border-night/20 hover:shadow-premium bg-surface/30 hover:bg-surface/50 relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-300">
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <span className="text-ink-soft block text-[10px] font-bold tracking-wider uppercase">
                    {tile.label}
                  </span>
                  <span className="text-ink-soft/60 mt-0.5 block text-[10px] leading-tight">
                    {tile.description}
                  </span>
                </div>
                <div className={`shrink-0 rounded-xl p-2.5 ${tile.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div
                className={`font-mono text-2xl font-bold tracking-tight tabular-nums ${
                  tile.warn ? "text-amber-500" : "text-ink"
                }`}
              >
                {tile.value}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
