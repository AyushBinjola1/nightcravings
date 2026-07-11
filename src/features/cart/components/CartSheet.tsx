"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";

import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cartSubtotal, useCartStore } from "@/stores/cart";

/**
 * Phase 2 §6 — a real, recalculated free-delivery progress bar, removed
 * entirely (replaced by a quiet confirmation) once crossed, never a fake
 * "deal." No coupon field: reserved but not built until a real promotions
 * system exists (Phase 2 §6).
 */
export function CartSheet({
  open,
  onOpenChange,
  deliveryFee,
  freeDeliveryThreshold,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryFee: number;
  freeDeliveryThreshold: number;
}) {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = cartSubtotal(items);
  const remainingForFreeDelivery = Math.max(
    0,
    freeDeliveryThreshold - subtotal,
  );
  const qualifiesForFreeDelivery = remainingForFreeDelivery === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Cart">
      {items.length === 0 ? (
        <p className="text-ink-soft py-8 text-center text-sm">
          Nothing here yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="divide-border flex flex-col divide-y">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 py-3">
                <span className="text-ink flex-1 text-sm">{item.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Remove one ${item.name}`}
                    onClick={() =>
                      setQuantity(item.productId, item.quantity - 1)
                    }
                    className="border-border text-ink flex h-7 w-7 items-center justify-center rounded-full border"
                  >
                    <Minus size={12} aria-hidden="true" />
                  </button>
                  <span className="text-ink min-w-[1.5ch] text-center text-sm tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Add one more ${item.name}`}
                    onClick={() =>
                      setQuantity(item.productId, item.quantity + 1)
                    }
                    className="border-border text-ink flex h-7 w-7 items-center justify-center rounded-full border"
                  >
                    <Plus size={12} aria-hidden="true" />
                  </button>
                </div>
                <span className="text-ink w-14 text-right font-mono text-sm tabular-nums">
                  ₹{(item.price * item.quantity).toFixed(0)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${item.name} from cart`}
                  onClick={() => removeItem(item.productId)}
                  className="text-ink-soft"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          {!qualifiesForFreeDelivery && deliveryFee > 0 && (
            <div className="bg-accent-soft text-accent rounded-md px-3 py-2 text-xs">
              Add ₹{remainingForFreeDelivery.toFixed(0)} more for free delivery
            </div>
          )}
          {qualifiesForFreeDelivery && deliveryFee > 0 && (
            <div className="bg-success-soft text-success rounded-md px-3 py-2 text-xs">
              Free delivery unlocked
            </div>
          )}

          <div className="border-border flex items-center justify-between border-t pt-3 text-sm">
            <span className="text-ink-soft">Subtotal</span>
            <span className="text-ink font-mono font-semibold tabular-nums">
              ₹{subtotal.toFixed(0)}
            </span>
          </div>

          <Button asChild>
            <Link href="/checkout" onClick={() => onOpenChange(false)}>
              Checkout
            </Link>
          </Button>
        </div>
      )}
    </Sheet>
  );
}
