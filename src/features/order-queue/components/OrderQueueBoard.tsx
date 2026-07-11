"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { OrderCard } from "@/features/order-queue/components/OrderCard";
import { createClient } from "@/lib/supabase/client";
import type { OrderQueueRow } from "@/server/queries/order-queue";

const LANES: {
  key: string;
  label: string;
  match: (status: OrderQueueRow["status"]) => boolean;
}[] = [
  {
    key: "awaiting_verification",
    label: "Awaiting Verification",
    match: (s) => s === "awaiting_verification",
  },
  {
    key: "preparing",
    label: "Preparing",
    match: (s) => s === "confirmed" || s === "preparing",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    match: (s) => s === "out_for_delivery",
  },
];

/**
 * Phase 3 §2 — three lanes, oldest-first (already sorted server-side),
 * realtime-subscribed per hostel (Phase 4 §10) so a new order or a
 * change made from a second device appears without a manual refresh.
 * Re-fetches via `router.refresh()` on any change rather than patching
 * client state field-by-field — simpler, and the Server Component query
 * is cheap enough at this scale that correctness wins over micro-perf.
 */
export function OrderQueueBoard({
  hostelId,
  orders,
}: {
  hostelId: string;
  orders: OrderQueueRow[];
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-queue-${hostelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `hostel_id=eq.${hostelId}`,
        },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hostelId, router]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {LANES.map((lane) => {
        const laneOrders = orders.filter((o) => lane.match(o.status));
        return (
          <div key={lane.key} className="flex flex-col gap-3">
            <h2 className="text-ink-soft font-mono text-xs font-medium tracking-wide uppercase">
              {lane.label} ({laneOrders.length})
            </h2>
            {laneOrders.length === 0 ? (
              <p className="text-ink-soft text-sm">All caught up</p>
            ) : (
              laneOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
