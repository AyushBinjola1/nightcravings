"use client";

import { ShoppingBag } from "lucide-react";

import { cartItemCount, cartSubtotal, useCartStore } from "@/stores/cart";

/**
 * Phase 2 §6 — appears the instant the first item is added, present on
 * every screen until checkout. Renders nothing (not an empty bar) when the
 * cart is empty, per Phase 2's empty-state convention.
 */
export function CartBar({ onOpen }: { onOpen: () => void }) {
  const items = useCartStore((state) => state.items);

  if (items.length === 0) {
    return null;
  }

  const count = cartItemCount(items);
  const subtotal = cartSubtotal(items);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="bg-accent text-paper fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-md px-4 py-3 shadow-lg sm:inset-x-auto sm:right-6 sm:w-80"
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <ShoppingBag size={18} aria-hidden="true" />
        {count} item{count === 1 ? "" : "s"}
      </span>
      <span className="font-mono text-sm font-semibold tabular-nums">
        ₹{subtotal.toFixed(0)}
      </span>
    </button>
  );
}
