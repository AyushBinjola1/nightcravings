"use client";

import { useMemo, useState } from "react";

import { CategoryTile } from "@/features/catalogue/components/CategoryTile";
import { ProductCard } from "@/features/catalogue/components/ProductCard";
import { ProductSheet } from "@/features/catalogue/components/ProductSheet";
import type { Category, Product } from "@/server/queries/catalogue";

/**
 * Client-side category filter + product grid + detail sheet. Receives
 * server-fetched data as props (Phase 4 §12: Server Components own the
 * fetch, client components own the interactivity) — this component never
 * fetches on its own.
 */
export function CatalogueBrowser({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);

  const visibleProducts = useMemo(
    () =>
      activeCategory
        ? products.filter((p) => p.category_id === activeCategory)
        : products,
    [products, activeCategory],
  );

  return (
    <div className="flex flex-col gap-4">
      {categories.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {categories.map((category) => (
            <CategoryTile
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onSelect={setActiveCategory}
            />
          ))}
        </div>
      )}

      {visibleProducts.length === 0 ? (
        <p className="text-ink-soft py-12 text-center text-sm">
          Nothing here yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={setOpenProduct}
            />
          ))}
        </div>
      )}

      <ProductSheet
        product={openProduct}
        onClose={() => setOpenProduct(null)}
      />
    </div>
  );
}
