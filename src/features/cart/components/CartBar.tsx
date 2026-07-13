"use client";

import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

import { cartItemCount, cartSubtotal, useCartStore } from "@/stores/cart";

export function CartBar({ onOpen }: { onOpen: () => void }) {
  const items = useCartStore((state) => state.items);

  if (items.length === 0) {
    return null;
  }

  const count = cartItemCount(items);
  const subtotal = cartSubtotal(items);

  return (
    <motion.button
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      type="button"
      onClick={onOpen}
      className="bg-accent text-paper shadow-accent/25 border-accent-soft/20 fixed inset-x-4 bottom-5 z-30 flex cursor-pointer items-center justify-between rounded-full border px-6 py-4 shadow-xl sm:inset-x-auto sm:right-6 sm:w-80"
    >
      <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <ShoppingBag size={18} aria-hidden="true" className="animate-bounce" />
        {count} item{count === 1 ? "" : "s"}
      </span>
      <span className="bg-paper/10 rounded-full px-3 py-1 font-mono text-sm font-bold tabular-nums">
        ₹{subtotal.toFixed(0)}
      </span>
    </motion.button>
  );
}
