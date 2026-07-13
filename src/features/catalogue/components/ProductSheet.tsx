"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";

import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart";
import type { Product } from "@/server/queries/catalogue";

/**
 * Phase 2 §5 — a bottom sheet, never a route: the underlying grid stays
 * mounted and scrolled to the same position when this closes. Frequently
 * Bought Together / Recommendations are intentionally not here yet — both
 * need real co-purchase data (Phase 3 §7's `recommendations` table),
 * which doesn't exist until enough real orders have been placed.
 */
export function ProductSheet({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const quantity = useCartStore((state) =>
    product
      ? (state.items.find((i) => i.productId === product.id)?.quantity ?? 0)
      : 0,
  );
  const addItem = useCartStore((state) => state.addItem);
  const setQuantity = useCartStore((state) => state.setQuantity);

  const isOutOfStock = (product?.stock_qty ?? 0) <= 0;
  const isLowStock = product && product.stock_qty > 0 && product.stock_qty <= 5;

  return (
    <Sheet
      open={product !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={product?.name ?? ""}
    >
      {product && (
        <div className="flex flex-col gap-5 pt-2">
          <div className="bg-surface-2 border-border/40 relative aspect-square w-full overflow-hidden rounded-2xl border shadow-sm">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-cover"
              />
            ) : (
              <div className="text-ink-soft flex h-full items-center justify-center text-sm font-semibold">
                No image preview available
              </div>
            )}
          </div>

          {product.description && (
            <p className="text-ink-soft text-sm leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="border-border/40 flex items-center justify-between border-t pt-4">
            <span className="text-ink font-mono text-2xl font-bold tabular-nums">
              ₹{product.price.toFixed(0)}
            </span>
            {isOutOfStock ? (
              <span className="bg-danger-soft text-danger rounded-full px-3 py-1 text-xs font-semibold">
                Out of stock
              </span>
            ) : isLowStock ? (
              <span className="bg-warning-soft text-warning rounded-full px-3 py-1 text-xs font-semibold">
                Only {product.stock_qty} items left
              </span>
            ) : (
              <span className="bg-success-soft text-success rounded-full px-3 py-1 text-xs font-semibold">
                In stock
              </span>
            )}
          </div>

          <div className="pt-2">
            {!isOutOfStock &&
              (quantity > 0 ? (
                <div className="border-border bg-surface/60 flex items-center justify-between gap-4 rounded-full border p-1 shadow-sm">
                  <button
                    type="button"
                    aria-label="Remove one"
                    onClick={() => setQuantity(product.id, quantity - 1)}
                    className="text-ink hover:bg-paper flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <span className="text-ink min-w-[2ch] text-center text-sm font-bold tabular-nums">
                    {quantity} in cart
                  </span>
                  <button
                    type="button"
                    aria-label="Add one more"
                    onClick={() =>
                      addItem({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                      })
                    }
                    className="text-ink hover:bg-paper flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() =>
                    addItem({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                    })
                  }
                  className="shadow-accent/15 w-full cursor-pointer rounded-full py-3 text-sm font-semibold shadow-md transition-transform active:scale-98"
                >
                  Add to cart
                </Button>
              ))}
          </div>
        </div>
      )}
    </Sheet>
  );
}
