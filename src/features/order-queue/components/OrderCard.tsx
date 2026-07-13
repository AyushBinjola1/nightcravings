"use client";

import { useState, useTransition } from "react";
import {
  Check,
  ChevronRight,
  AlertCircle,
  Eye,
  Phone,
  MapPin,
} from "lucide-react";

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
      className={`bg-paper border-border/80 hover:border-night/20 relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md`}
    >
      {/* Side strip highlighting age/urgency */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-1.5 ${
          isUrgent ? "bg-danger animate-pulse" : "bg-night/40"
        }`}
      />

      <div className="pl-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-ink text-sm leading-tight font-bold sm:text-base">
              {order.customerName}
            </h3>
            <div className="text-ink-soft mt-1 flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="bg-surface-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
                <MapPin size={10} />{" "}
                {order.roomNumber ? `Room ${order.roomNumber}` : "Self Pickup"}
              </span>
              <span className="bg-surface-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
                <Phone size={10} /> {order.customerPhone}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-night font-mono text-sm font-bold tabular-nums sm:text-base">
              ₹{order.total.toFixed(0)}
            </div>
            <span
              className={`mt-1 block text-[10px] font-bold tracking-wider uppercase ${
                isUrgent
                  ? "text-danger flex items-center gap-0.5"
                  : "text-ink-soft"
              }`}
            >
              {isUrgent && <AlertCircle size={10} />} {age} mins ago
            </span>
          </div>
        </div>

        {/* Ordered items breakdown */}
        <div className="border-border/40 mt-3 flex flex-col gap-1.5 border-t pt-3">
          <div className="text-ink text-xs leading-relaxed font-medium tracking-tight">
            {order.items
              .map((item) => `${item.quantity}× ${item.name}`)
              .join(", ")}
          </div>
          {order.notes && (
            <p className="text-ink-soft bg-surface/50 border-border/40 mt-1 rounded-xl border p-2 text-[11px] leading-relaxed italic">
              &ldquo;{order.notes}&rdquo;
            </p>
          )}
        </div>

        {/* Dynamic lane status triggers */}
        <div className="border-border/40 mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t pt-2.5">
          {order.status === "awaiting_verification" && order.payment && (
            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-500 uppercase">
                  Verification Required
                </span>
                {order.payment.transactionId && (
                  <span className="text-ink-soft bg-surface-2 rounded-full px-2 py-0.5 font-mono text-[10px]">
                    UTR: {order.payment.transactionId}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {order.payment.screenshotUrl ? (
                  <button
                    type="button"
                    onClick={() => setScreenshotOpen(true)}
                    className="border-border/60 hover:border-night/30 group relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-xl border shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- a private Supabase Storage signed URL, not an optimizable static asset */}
                    <img
                      src={order.payment.screenshotUrl}
                      alt="Receipt screen"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="bg-ink/30 text-paper absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <Eye size={12} />
                    </div>
                  </button>
                ) : (
                  <span className="text-ink-soft text-[10px] italic">
                    No proof image
                  </span>
                )}

                <div className="flex flex-1 gap-2">
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      runAction(() =>
                        approvePayment(order.payment!.id, order.id),
                      )
                    }
                    className="bg-success text-paper flex-1 cursor-pointer rounded-full py-2 text-xs"
                  >
                    Approve
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
                    className="cursor-pointer rounded-full py-2 text-xs"
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {order.payment.screenshotUrl && (
                <Sheet
                  open={screenshotOpen}
                  onOpenChange={setScreenshotOpen}
                  title="Payment screenshot proof"
                  contentClassName="flex flex-col items-center"
                >
                  <div className="bg-paper border-border/60 mt-4 mb-4 rounded-3xl border p-2.5 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element -- a private Supabase Storage signed URL, not an optimizable static asset */}
                    <img
                      src={order.payment.screenshotUrl}
                      alt="Payment screenshot"
                      className="max-h-[70vh] rounded-2xl object-contain"
                    />
                  </div>
                </Sheet>
              )}
            </div>
          )}

          {(order.status === "confirmed" || order.status === "preparing") && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => runAction(() => markOutForDelivery(order.id))}
              className="shadow-accent/15 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold shadow-md"
            >
              Start Delivery <ChevronRight size={12} />
            </Button>
          )}

          {order.status === "out_for_delivery" && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => runAction(() => markDelivered(order.id))}
              className="shadow-accent/15 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold shadow-md"
            >
              Mark as Delivered <Check size={12} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
