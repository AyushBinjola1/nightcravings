"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { captureEvent } from "@/lib/analytics/posthog-client";
import { useCartStore } from "@/stores/cart";
import type { Product } from "@/server/queries/catalogue";

const LOW_STOCK_THRESHOLD = 5;

/**
 * Phase 2 §4 — every element either speeds up the add-to-cart decision or
 * builds trust; nothing decorative. Stock badge is silent unless genuinely
 * low (never fabricated scarcity). The Add control morphs into a
 * quantity stepper the moment the item is in the cart, in place, so a
 * repeat add never re-opens anything.
 */
export function ProductCard({
  product,
  onOpenDetail,
}: {
  product: Product;
  onOpenDetail: (product: Product) => void;
}) {
  const quantity = useCartStore(
    (state) =>
      state.items.find((i) => i.productId === product.id)?.quantity ?? 0,
  );
  const addItem = useCartStore((state) => state.addItem);
  const setQuantity = useCartStore((state) => state.setQuantity);

  const isLowStock =
    product.stock_qty > 0 && product.stock_qty <= LOW_STOCK_THRESHOLD;
  const isOutOfStock = product.stock_qty <= 0;

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
    });
    captureEvent("product_added_to_cart", {
      productId: product.id,
      name: product.name,
      price: product.price,
      source: "product_card",
    });
  }

  return (
    <div className="border-border bg-surface flex flex-col overflow-hidden rounded-md border">
      <button
        type="button"
        onClick={() => onOpenDetail(product)}
        aria-label={`${product.name}, ₹${product.price}${isOutOfStock ? ", out of stock" : ""}`}
        className="bg-surface-2 relative aspect-square w-full"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="text-ink-soft flex h-full items-center justify-center text-xs">
            No image
          </div>
        )}
        {isOutOfStock ? (
          <Badge variant="danger" className="absolute top-2 left-2">
            Out of stock
          </Badge>
        ) : isLowStock ? (
          <Badge variant="warning" className="absolute top-2 left-2">
            Only {product.stock_qty} left
          </Badge>
        ) : null}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <button
          type="button"
          onClick={() => onOpenDetail(product)}
          className="text-ink text-left text-sm font-medium"
        >
          {product.name}
        </button>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-ink font-mono text-sm font-semibold tabular-nums">
            ₹{product.price.toFixed(0)}
          </span>

          {isOutOfStock ? null : quantity > 0 ? (
            <div className="border-border bg-paper flex items-center gap-2 rounded-full border">
              <button
                type="button"
                aria-label={`Remove one ${product.name}`}
                onClick={() => setQuantity(product.id, quantity - 1)}
                className="text-ink flex h-8 w-8 items-center justify-center"
              >
                <Minus size={14} aria-hidden="true" />
              </button>
              <span className="text-ink min-w-[1.5ch] text-center text-sm font-medium tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                aria-label={`Add one more ${product.name}`}
                onClick={handleAdd}
                className="text-ink flex h-8 w-8 items-center justify-center"
              >
                <Plus size={14} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label={`Add ${product.name} to cart`}
              onClick={handleAdd}
              className="bg-accent text-paper flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-95"
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
