"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OrderCard } from "@/features/order-queue/components/OrderCard";
import { useHostelOrdersRealtime } from "@/hooks/useHostelOrdersRealtime";
import type { OrderQueueRow } from "@/server/queries/order-queue";

const LANES: {
  key: string;
  label: string;
  match: (status: OrderQueueRow["status"]) => boolean;
  colorClass: string;
}[] = [
  {
    key: "awaiting_verification",
    label: "Awaiting Verification",
    match: (s) => s === "awaiting_verification",
    colorClass: "border-t-amber-500",
  },
  {
    key: "preparing",
    label: "Preparing",
    match: (s) => s === "confirmed" || s === "preparing",
    colorClass: "border-t-blue-500",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    match: (s) => s === "out_for_delivery",
    colorClass: "border-t-purple-500",
  },
];

/**
 * Phase 3 §2 — three lanes, oldest-first (already sorted server-side),
 * realtime-subscribed per hostel (Phase 4 §10) so a new order or a
 * change made from a second device appears without a manual refresh.
 */
export function OrderQueueBoard({
  hostelId,
  orders,
}: {
  hostelId: string;
  orders: OrderQueueRow[];
}) {
  useHostelOrdersRealtime(hostelId);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {LANES.map((lane) => {
        const laneOrders = orders.filter((o) => lane.match(o.status));
        return (
          <div
            key={lane.key}
            className={`bg-surface/10 border-border/60 flex flex-col gap-4 border border-t-4 ${lane.colorClass} min-h-[500px] rounded-2xl p-4.5 shadow-sm`}
          >
            <div className="border-border/40 mb-1.5 flex items-center justify-between border-b pb-2.5">
              <h2 className="text-ink-soft text-xs font-bold tracking-wider uppercase">
                {lane.label}
              </h2>
              <span className="bg-surface-2 text-ink rounded-full px-2 py-0.5 text-[10px] font-bold">
                {laneOrders.length}
              </span>
            </div>

            <div className="flex max-h-[70vh] flex-grow flex-col gap-3.5 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {laneOrders.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-ink-soft py-8 text-center text-xs font-semibold italic"
                  >
                    All caught up
                  </motion.p>
                ) : (
                  laneOrders.map((order) => (
                    <motion.div
                      layout
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 25,
                      }}
                    >
                      <OrderCard order={order} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
