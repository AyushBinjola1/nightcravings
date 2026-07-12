"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/stores/toast";
import { adjustStock, setProductHidden } from "@/server/actions/products";
import { ProductFormSheet } from "@/features/products/components/ProductFormSheet";
import { StockAdjuster } from "@/features/products/components/StockAdjuster";
import type { Category, Product } from "@/server/queries/catalogue";

/**
 * Phase 3 §5 — Product Management: add, edit, and hide/unhide, plus the
 * stock adjustments `StockAdjuster` owns. There's no bulk import here —
 * a hostel-shop-sized menu (a few dozen items) is comfortably managed
 * one product at a time.
 */
export function ProductManager({
  hostelId,
  categories,
  products,
}: {
  hostelId: string;
  categories: Category[];
  products: Product[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const toggleHidden = (product: Product) => {
    startTransition(async () => {
      const result = await setProductHidden(
        product.id,
        product.status !== "hidden",
      );
      if (!result.success) {
        useToastStore.getState().show(result.error, "danger");
      }
    });
  };

  /** Zeroes stock via the same append-only `stock_history` path
   * `StockAdjuster` uses — "out of stock" here just means `stock_qty <=
   * 0`, the same signal `ProductCard` already reads to gray out a
   * product and disable Add on the customer side. */
  const markOutOfStock = (product: Product) => {
    if (product.stock_qty <= 0) return;
    startTransition(async () => {
      const result = await adjustStock({
        productId: product.id,
        delta: -product.stock_qty,
      });
      if (!result.success) {
        useToastStore.getState().show(result.error, "danger");
      }
    });
  };

  if (categories.length === 0) {
    return (
      <p className="text-ink-soft text-sm">
        Add a category first (Phase 3 doesn&apos;t yet have a category editor
        here — create one via the database, then products can be assigned to
        it).
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Button type="button" onClick={openCreate} className="self-start">
        Add product
      </Button>

      <div className="flex flex-col gap-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="border-border bg-surface flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary external CDN URLs staff paste in, not app-optimizable assets
                <img
                  src={product.image_url}
                  alt=""
                  className="border-border h-14 w-14 rounded-md border object-cover"
                />
              ) : (
                <div className="border-border bg-surface-2 text-ink-soft flex h-14 w-14 items-center justify-center rounded-md border text-[10px]">
                  No image
                </div>
              )}
              <div>
                <div className="text-ink flex items-center gap-2 font-medium">
                  {product.name}
                  {product.status === "hidden" && (
                    <Badge variant="neutral">Hidden</Badge>
                  )}
                  {product.stock_qty <= 0 && (
                    <Badge variant="danger">Out of stock</Badge>
                  )}
                </div>
                <div className="text-ink-soft font-mono text-sm tabular-nums">
                  ₹{product.price.toFixed(0)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StockAdjuster
                productId={product.id}
                stockQty={product.stock_qty}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => openEdit(product)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending || product.stock_qty <= 0}
                onClick={() => markOutOfStock(product)}
              >
                Mark out of stock
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => toggleHidden(product)}
              >
                {product.status === "hidden" ? "Unhide" : "Remove from menu"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ProductFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        hostelId={hostelId}
        categories={categories}
        product={editingProduct}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
