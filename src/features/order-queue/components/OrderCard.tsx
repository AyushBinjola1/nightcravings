"use client";

import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useToastStore } from "@/stores/toast";
import type { OrderQueueRow } from "@/server/queries/order-queue";
import {
  approvePayment,
  markDelivered,
  markOutForDelivery,
  rejectPayment,
} from "@/server/actions/order-queue";

const MINUTE_MS = 60_000;

function minutesAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / MINUTE_MS);
}

/**
 * Phase 3 §2 — everything needed to act on an order lives on this one
 * card: no secondary navigation for the common case. Payment
 * verification is inline here (not a separate screen), per the Phase 3
 * Self-Review's redesign of the brief's original two-screen split.
 */
export function OrderCard({ order }: { order: OrderQueueRow }) {
  const [isPending, startTransition] = useTransition();
  const [screenshotOpen, setScreenshotOpen] = useState(false);
  const age = minutesAgo(order.createdAt);
  const isUrgent = age > 15;

  const runAction = (
    fn: () => Promise<{ success: boolean; error?: string }>,
  ) => {
    startTransition(async () => {
      const result = await fn();
      if (!result.success) {
        useToastStore
          .getState()
          .show(result.error ?? "Action failed", "danger");
      }
    });
  };

  return (
    <div
      className={`bg-surface rounded-md border p-4 ${isUrgent ? "border-l-danger border-l-4" : "border-border"}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="font-display text-ink font-semibold">
            {order.customerName}
          </div>
          <div className="text-ink-soft font-mono text-xs">
            {order.roomNumber ? `Room ${order.roomNumber}` : "Pickup"} ·{" "}
            {order.customerPhone}
          </div>
        </div>
        <div className="text-right">
          <div className="text-ink font-mono font-semibold tabular-nums">
            ₹{order.total.toFixed(0)}
          </div>
          <div className="text-ink-soft font-mono text-xs">{age} min ago</div>
        </div>
      </div>

      <div className="text-ink-soft mb-3 text-sm">
        {order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
        {order.notes && (
          <div className="mt-1 italic">&ldquo;{order.notes}&rdquo;</div>
        )}
      </div>

      {order.status === "awaiting_verification" && order.payment && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="warning">Awaiting Verification</Badge>

          {order.payment.screenshotUrl ? (
            <button
              type="button"
              onClick={() => setScreenshotOpen(true)}
              className="border-border block w-24 shrink-0 overflow-hidden rounded-md border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a private Supabase Storage signed URL, not an optimizable static asset */}
              <img
                src={order.payment.screenshotUrl}
                alt="Payment screenshot — tap to enlarge"
                className="aspect-square w-full object-cover"
              />
            </button>
          ) : (
            <span className="text-ink-soft text-xs italic">
              No screenshot attached
            </span>
          )}

          <div className="flex w-full gap-2">
            <Button
              size="sm"
              disabled={isPending}
              onClick={() =>
                runAction(() => approvePayment(order.payment!.id, order.id))
              }
            >
              Approve Payment
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={() =>
                runAction(() =>
                  rejectPayment({
                    paymentId: order.payment!.id,
                    reason: "other",
                  }),
                )
              }
            >
              Reject
            </Button>
            {order.payment.transactionId && (
              <span className="text-ink-soft self-center font-mono text-xs">
                UTR {order.payment.transactionId}
              </span>
            )}
          </div>

          {order.payment.screenshotUrl && (
            <Sheet
              open={screenshotOpen}
              onOpenChange={setScreenshotOpen}
              title="Payment screenshot"
              contentClassName="flex flex-col items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a private Supabase Storage signed URL, not an optimizable static asset */}
              <img
                src={order.payment.screenshotUrl}
                alt="Payment screenshot"
                className="max-h-[70vh] w-full rounded-md object-contain"
              />
            </Sheet>
          )}
        </div>
      )}

      {(order.status === "confirmed" || order.status === "preparing") && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => runAction(() => markOutForDelivery(order.id))}
        >
          Mark Delivery Coming
        </Button>
      )}

      {order.status === "out_for_delivery" && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => runAction(() => markDelivered(order.id))}
        >
          Mark Delivered
        </Button>
      )}
    </div>
  );
}
