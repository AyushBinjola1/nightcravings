"use client";

import Link from "next/link";

import { useOrderHistoryStore } from "@/stores/order-history";

/**
 * Phase 2 §10 — "order history" without an account: this browser's own
 * locally-remembered list of orders it placed, each a link straight into
 * live tracking (Phase 2 §9). A different device sees nothing, which is
 * the honest tradeoff stated in `stores/order-history.ts`.
 */
export function OrderHistoryList() {
  const entries = useOrderHistoryStore((state) => state.entries);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-ink-soft text-sm">No orders yet on this device.</p>
        <Link
          href="/"
          className="text-accent text-sm underline underline-offset-2"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-border flex flex-col divide-y">
      {entries.map((entry) => (
        <li key={entry.orderId}>
          <Link
            href={`/orders/${entry.orderId}`}
            className="flex items-center justify-between py-3 text-sm"
          >
            <span className="text-ink-soft">
              {new Date(entry.placedAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <span className="text-ink font-mono font-medium tabular-nums">
              ₹{entry.total.toFixed(0)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
