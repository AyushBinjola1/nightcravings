"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { captureEvent } from "@/lib/analytics/posthog-client";
import { useCartStore } from "@/stores/cart";
import type { Product } from "@/server/queries/catalogue";

const LOW_STOCK_THRESHOLD = 5;

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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="group border-border bg-surface/40 hover:bg-surface/90 hover:border-night/30 hover:shadow-premium relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300"
    >
      <button
        type="button"
        onClick={() => onOpenDetail(product)}
        aria-label={`${product.name}, ₹${product.price}${isOutOfStock ? ", out of stock" : ""}`}
        className="bg-surface-2 relative block aspect-square w-full overflow-hidden"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              isOutOfStock ? "opacity-60 grayscale" : ""
            }`}
          />
        ) : (
          <div className="text-ink-soft flex h-full items-center justify-center text-xs font-medium">
            No image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {isOutOfStock ? (
            <Badge variant="danger" className="shadow-sm">
              Out of stock
            </Badge>
          ) : isLowStock ? (
            <Badge variant="warning" className="animate-pulse shadow-sm">
              Only {product.stock_qty} left
            </Badge>
          ) : null}
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-2.5 p-4.5">
        <button
          type="button"
          onClick={() => onOpenDetail(product)}
          className="text-ink hover:text-night line-clamp-2 cursor-pointer text-left text-sm font-semibold tracking-tight transition-colors"
        >
          {product.name}
        </button>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-ink font-mono text-base font-bold tabular-nums">
            ₹{product.price.toFixed(0)}
          </span>

          <div className="flex h-9 items-center justify-end">
            <AnimatePresence mode="wait">
              {isOutOfStock ? null : quantity > 0 ? (
                <motion.div
                  key="stepper"
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className="border-border bg-paper flex items-center gap-1 rounded-full border shadow-sm"
                >
                  <button
                    type="button"
                    aria-label={`Remove one ${product.name}`}
                    onClick={() => setQuantity(product.id, quantity - 1)}
                    className="text-ink hover:bg-surface flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  >
                    <Minus size={12} aria-hidden="true" />
                  </button>
                  <span className="text-ink min-w-[2ch] text-center text-xs font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Add one more ${product.name}`}
                    onClick={handleAdd}
                    className="text-ink hover:bg-surface flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  >
                    <Plus size={12} aria-hidden="true" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="add-button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  aria-label={`Add ${product.name} to cart`}
                  onClick={handleAdd}
                  className="bg-accent text-paper shadow-accent/20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-md"
                >
                  <Plus size={16} aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
