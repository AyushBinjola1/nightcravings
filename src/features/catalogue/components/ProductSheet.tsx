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

  return (
    <Sheet
      open={product !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={product?.name ?? ""}
    >
      {product && (
        <div className="flex flex-col gap-4">
          <div className="bg-surface-2 relative aspect-square w-full overflow-hidden rounded-md">
            {product.image_url && (
              <Image
                src={product.image_url}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-cover"
              />
            )}
          </div>

          {product.description && (
            <p className="text-ink-soft text-sm">{product.description}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-ink font-mono text-lg font-semibold tabular-nums">
              ₹{product.price.toFixed(0)}
            </span>
            {isOutOfStock && (
              <span className="text-danger text-sm">Out of stock</span>
            )}
          </div>

          {!isOutOfStock &&
            (quantity > 0 ? (
              <div className="border-border bg-paper flex items-center justify-center gap-4 rounded-md border py-2">
                <button
                  type="button"
                  aria-label="Remove one"
                  onClick={() => setQuantity(product.id, quantity - 1)}
                  className="text-ink flex h-9 w-9 items-center justify-center"
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
                <span className="text-ink min-w-[2ch] text-center font-medium tabular-nums">
                  {quantity}
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
                  className="text-ink flex h-9 w-9 items-center justify-center"
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
              >
                Add to cart
              </Button>
            ))}
        </div>
      )}
    </Sheet>
  );
}
