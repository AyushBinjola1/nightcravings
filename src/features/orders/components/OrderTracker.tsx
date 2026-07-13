"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Clock,
  ShieldCheck,
  MapPin,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { OrderTracking } from "@/server/queries/tracking";
import type { Database } from "@/types/database";

type OrderStatus = Database["public"]["Enums"]["order_status"];

const STAGES: {
  status: OrderStatus;
  label: string;
  icon: LucideIcon;
  description: string;
}[] = [
  {
    status: "awaiting_verification",
    label: "Payment Submitted",
    icon: Clock,
    description: "Waiting for store verification",
  },
  {
    status: "confirmed",
    label: "Order Confirmed",
    icon: ShieldCheck,
    description: "Verified & sent to kitchen",
  },
  {
    status: "out_for_delivery",
    label: "Delivery Coming",
    icon: MapPin,
    description: "On the way to your hostel room",
  },
  {
    status: "delivered",
    label: "Delivered",
    icon: PackageCheck,
    description: "Enjoy your late-night cravings!",
  },
];

function stageIndexFor(status: OrderStatus): number {
  if (status === "preparing") return 1;
  return STAGES.findIndex((s) => s.status === status);
}

export function OrderTracker({ initial }: { initial: OrderTracking }) {
  const [order, setOrder] = useState(initial);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          const next =
            payload.new as Database["public"]["Tables"]["orders"]["Row"];
          setOrder((current) => ({
            ...current,
            status: next.status,
            updatedAt: next.updated_at,
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id]);

  if (order.status === "cancelled") {
    return (
      <div className="border-danger/20 bg-danger-soft/40 text-danger flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold">
        <span>
          This order was cancelled. Please contact the store support if you have
          questions.
        </span>
      </div>
    );
  }

  const activeIndex = stageIndexFor(order.status);

  return (
    <div className="flex flex-col gap-6">
      {/* Tracker timeline card */}
      <div className="border-border/60 bg-surface/30 shadow-premium relative rounded-3xl border p-6">
        <div className="bg-night/5 pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full blur-xl filter" />

        <ol className="relative flex flex-col gap-8 pl-1">
          {STAGES.map((stage, index) => {
            const isCompleted = index < activeIndex;
            const isActive = index === activeIndex;
            const Icon = stage.icon;

            return (
              <motion.li
                key={stage.status}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4"
              >
                {/* Connector line */}
                {index < STAGES.length - 1 && (
                  <div className="bg-border/50 absolute top-10 bottom-0 left-5 -ml-[1px] w-0.5">
                    <motion.div
                      className="bg-night h-full w-full origin-top"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: isCompleted ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}

                {/* Milestone Node Icon */}
                <div className="relative z-10">
                  {isCompleted ? (
                    <motion.div
                      className="bg-night text-paper flex h-10 w-10 items-center justify-center rounded-full shadow-sm"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Check size={18} />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      className="bg-paper border-night text-night shadow-glow-purple flex h-10 w-10 items-center justify-center rounded-full border-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Icon size={18} className="animate-pulse" />
                    </motion.div>
                  ) : (
                    <div className="bg-surface-2 border-border text-ink-soft flex h-10 w-10 items-center justify-center rounded-full border">
                      <Icon size={16} />
                    </div>
                  )}
                </div>

                {/* Stage Text details */}
                <div className="flex flex-col pt-1">
                  <span
                    className={`text-sm font-bold ${
                      isActive
                        ? "text-night font-bold"
                        : isCompleted
                          ? "text-ink"
                          : "text-ink-soft/80"
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-ink-soft mt-0.5 text-xs leading-relaxed font-medium">
                    {stage.description}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>

      {order.paymentStatus && (
        <div className="border-border/40 bg-surface/10 flex items-center justify-between rounded-2xl border px-5 py-4 shadow-sm">
          <span className="text-ink-soft text-xs font-bold tracking-wider uppercase">
            Payment Status
          </span>
          <Badge
            variant={order.paymentStatus === "approved" ? "success" : "warning"}
            className="rounded-full px-3 py-1 text-xs font-bold"
          >
            {order.paymentStatus === "approved"
              ? "Verified"
              : "Pending Verification"}
          </Badge>
        </div>
      )}

      {/* Price breakdown */}
      <div className="border-border/60 bg-surface/30 flex items-center justify-between rounded-2xl border p-5 shadow-sm">
        <span className="text-ink-soft text-sm font-bold tracking-wider uppercase">
          Amount Claimed
        </span>
        <span className="text-ink text-night font-mono text-lg font-bold tabular-nums">
          ₹{order.total.toFixed(0)}
        </span>
      </div>
    </div>
  );
}
