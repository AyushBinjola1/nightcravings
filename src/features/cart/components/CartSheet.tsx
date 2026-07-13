"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { Minus, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cartSubtotal, useCartStore } from "@/stores/cart";
import type { Product } from "@/server/queries/catalogue";

export function CartSheet({
  open,
  onOpenChange,
  deliveryFee,
  freeDeliveryThreshold,
  products = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  products?: Product[];
}) {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = cartSubtotal(items);
  const remainingForFreeDelivery = Math.max(
    0,
    freeDeliveryThreshold - subtotal,
  );
  const qualifiesForFreeDelivery = remainingForFreeDelivery === 0;
  const progressPercent = Math.min(
    100,
    (subtotal / freeDeliveryThreshold) * 100,
  );

  // Recommendations: in stock items not in cart (limit to 2)
  const recommendedProducts = useMemo(() => {
    const cartProductIds = new Set(items.map((i) => i.productId));
    return products
      .filter((p) => p.stock_qty > 0 && !cartProductIds.has(p.id))
      .slice(0, 2);
  }, [products, items]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Cart">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-ink-soft text-sm font-medium">
            Your cart is empty.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Progress Bar */}
          <div className="bg-surface/50 border-border/40 flex flex-col gap-2 rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold">
              {!qualifiesForFreeDelivery && deliveryFee > 0 ? (
                <>
                  <span className="text-ink-soft">Free delivery progress</span>
                  <span className="text-accent font-bold">
                    Add ₹{remainingForFreeDelivery.toFixed(0)} more
                  </span>
                </>
              ) : (
                <>
                  <span className="text-ink-soft">Free delivery status</span>
                  <span className="text-success flex items-center gap-1 font-bold">
                    ✨ Free delivery unlocked
                  </span>
                </>
              )}
            </div>
            <div className="bg-surface-2 relative h-2 w-full overflow-hidden rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className={`h-full rounded-full ${qualifiesForFreeDelivery ? "bg-success" : "bg-accent"}`}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <ul className="flex max-h-[40vh] flex-col overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={item.productId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="overflow-hidden"
                >
                  <div className="border-border/40 flex items-center gap-3 border-b py-3">
                    <span className="text-ink flex-1 truncate text-sm font-semibold tracking-tight">
                      {item.name}
                    </span>
                    <div className="bg-surface/50 border-border/50 flex items-center gap-1.5 rounded-full border p-0.5 shadow-sm">
                      <button
                        type="button"
                        aria-label={`Remove one ${item.name}`}
                        onClick={() =>
                          setQuantity(item.productId, item.quantity - 1)
                        }
                        className="text-ink hover:bg-paper flex h-6 w-6 items-center justify-center rounded-full transition-colors"
                      >
                        <Minus size={10} aria-hidden="true" />
                      </button>
                      <span className="text-ink min-w-[2ch] text-center text-xs font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Add one more ${item.name}`}
                        onClick={() =>
                          setQuantity(item.productId, item.quantity + 1)
                        }
                        className="text-ink hover:bg-paper flex h-6 w-6 items-center justify-center rounded-full transition-colors"
                      >
                        <Plus size={10} aria-hidden="true" />
                      </button>
                    </div>
                    <span className="text-ink w-14 text-right font-mono text-sm font-bold tabular-nums">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name} from cart`}
                      onClick={() => removeItem(item.productId)}
                      className="text-ink-soft hover:text-danger hover:bg-danger-soft cursor-pointer rounded-full p-1 transition-colors"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {/* Suggestions */}
          {recommendedProducts.length > 0 && (
            <div className="border-border/30 flex flex-col gap-2.5 border-t pt-4">
              <span className="text-ink-soft text-[10px] font-bold tracking-wider uppercase">
                Suggested Add-ons
              </span>
              <div className="flex flex-col gap-2">
                {recommendedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="border-border/30 bg-surface/30 flex items-center justify-between gap-3 rounded-xl border p-2.5 shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {p.image_url ? (
                        <div className="bg-surface-2 relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={p.image_url}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="bg-surface-2 text-ink-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px]">
                          No img
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-ink truncate text-xs font-semibold">
                          {p.name}
                        </p>
                        <p className="text-ink-soft font-mono text-xs font-bold">
                          ₹{p.price.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        addItem({
                          productId: p.id,
                          name: p.name,
                          price: p.price,
                        })
                      }
                      className="hover:bg-accent hover:text-paper hover:border-accent shrink-0 cursor-pointer rounded-full px-3.5 py-1 text-xs font-bold transition-all active:scale-95"
                    >
                      + Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checkout section */}
          <div className="border-border/30 flex flex-col gap-3 border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-soft font-medium">Subtotal</span>
              <span className="text-ink font-mono text-lg font-bold tabular-nums">
                ₹{subtotal.toFixed(0)}
              </span>
            </div>

            <Button
              asChild
              className="shadow-accent/20 w-full cursor-pointer rounded-full py-3.5 font-bold shadow-md"
            >
              <Link href="/checkout" onClick={() => onOpenChange(false)}>
                Checkout
              </Link>
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
