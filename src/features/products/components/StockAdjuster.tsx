"use client";

import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";

import { useToastStore } from "@/stores/toast";
import { adjustStock } from "@/server/actions/products";

/** A quick "restock/correct by N" control — every change still goes
 * through `adjustStock`'s `stock_history` insert, never a direct
 * `stock_qty` write (see that action's own comment). */
export function StockAdjuster({
  productId,
  stockQty,
}: {
  productId: string;
  stockQty: number;
}) {
  const [amount, setAmount] = useState(1);
  const [isPending, startTransition] = useTransition();

  const apply = (sign: 1 | -1) => {
    startTransition(async () => {
      const result = await adjustStock({
        productId,
        delta: sign * amount,
      });
      if (!result.success) {
        useToastStore.getState().show(result.error, "danger");
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-ink font-mono text-sm tabular-nums">
        {stockQty} in stock
      </span>
      <input
        type="number"
        min={1}
        value={amount}
        onChange={(event) => setAmount(Math.max(1, Number(event.target.value)))}
        aria-label="Adjustment amount"
        className="border-border bg-paper text-ink w-14 rounded-md border px-1.5 py-1 text-center text-xs outline-none"
      />
      <button
        type="button"
        disabled={isPending}
        onClick={() => apply(-1)}
        aria-label="Decrease stock"
        className="border-border text-ink flex h-7 w-7 items-center justify-center rounded-md border disabled:opacity-60"
      >
        <Minus size={12} aria-hidden="true" />
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => apply(1)}
        aria-label="Increase stock"
        className="border-border text-ink flex h-7 w-7 items-center justify-center rounded-md border disabled:opacity-60"
      >
        <Plus size={12} aria-hidden="true" />
      </button>
    </div>
  );
}
