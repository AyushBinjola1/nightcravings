"use client";

import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";

import { useToastStore } from "@/stores/toast";
import { adjustStock } from "@/server/actions/products";

/** A quick "restock/correct by N" control — every change still goes
 * through `adjustStock`'s `stock_history` insert, never a direct
 * `stock_qty` write (see that action's own comment).
 *
 * The amount is kept as a raw string, not a clamped number, while
 * typing — clamping on every keystroke made the field impossible to
 * clear and retype (deleting to an empty string parsed as `0`, got
 * floored back to `1`, and any digit typed next appended to that
 * stuck "1" instead of replacing it). Clamping only happens when a
 * button is actually pressed. */
export function StockAdjuster({
  productId,
  stockQty,
}: {
  productId: string;
  stockQty: number;
}) {
  const [amountInput, setAmountInput] = useState("1");
  const [isPending, startTransition] = useTransition();

  const apply = (sign: 1 | -1) => {
    const parsed = Math.max(1, Math.trunc(Number(amountInput) || 1));
    setAmountInput(String(parsed));
    startTransition(async () => {
      const result = await adjustStock({
        productId,
        delta: sign * parsed,
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
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={amountInput}
        onChange={(event) => {
          const next = event.target.value;
          if (/^[0-9]*$/.test(next)) setAmountInput(next);
        }}
        onBlur={() => {
          if (amountInput.trim() === "") setAmountInput("1");
        }}
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
