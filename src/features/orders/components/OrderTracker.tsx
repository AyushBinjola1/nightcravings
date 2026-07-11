"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { OrderTracking } from "@/server/queries/tracking";
import type { Database } from "@/types/database";

type OrderStatus = Database["public"]["Enums"]["order_status"];

const STAGES: { status: OrderStatus; label: string }[] = [
  { status: "awaiting_verification", label: "Payment Submitted" },
  { status: "confirmed", label: "Order Confirmed" },
  { status: "out_for_delivery", label: "Delivery Coming" },
  { status: "delivered", label: "Delivered" },
];

/** Collapses the Owner Console's finer-grained stages into what Phase 2
 * §9's customer-facing stepper actually shows — "preparing" reads to a
 * customer as still "Order Confirmed," not a separate step. */
function stageIndexFor(status: OrderStatus): number {
  if (status === "preparing") return 1;
  return STAGES.findIndex((s) => s.status === status);
}

/**
 * Phase 2 §9 — a live status stepper, updated via Supabase Realtime
 * (Phase 4 §10) rather than polling. No fake map/GPS pin for a 40-meter
 * walk — just an honest stage list.
 */
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
      <div className="border-danger/30 bg-danger-soft text-danger rounded-md border px-4 py-3 text-sm">
        This order was cancelled. Contact the store if you have questions.
      </div>
    );
  }

  const activeIndex = stageIndexFor(order.status);

  return (
    <div className="flex flex-col gap-4">
      <ol className="border-border flex flex-col border-l pl-4">
        {STAGES.map((stage, index) => {
          const isDone = index <= activeIndex;
          return (
            <li key={stage.status} className="relative pb-6 last:pb-0">
              <span
                className={`absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full border-2 ${
                  isDone ? "border-night bg-night" : "border-border bg-paper"
                }`}
              />
              <span
                className={`text-sm ${isDone ? "text-ink font-medium" : "text-ink-soft"}`}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>

      {order.paymentStatus && (
        <Badge
          variant={order.paymentStatus === "approved" ? "success" : "warning"}
        >
          Payment {order.paymentStatus}
        </Badge>
      )}

      <div className="border-border flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-ink-soft">Total</span>
        <span className="text-ink font-mono font-semibold tabular-nums">
          ₹{order.total.toFixed(0)}
        </span>
      </div>
    </div>
  );
}
