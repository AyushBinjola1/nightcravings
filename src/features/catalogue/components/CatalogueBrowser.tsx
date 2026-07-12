"use client";

import { useMemo, useState } from "react";
import { LayoutGrid } from "lucide-react";

import { cn } from "@/lib/cn";
import { CategoryTile } from "@/features/catalogue/components/CategoryTile";
import { ProductCard } from "@/features/catalogue/components/ProductCard";
import { ProductSheet } from "@/features/catalogue/components/ProductSheet";
import { SearchBar } from "@/features/catalogue/components/SearchBar";
import { SearchEmptyState } from "@/features/catalogue/components/SearchEmptyState";
import type { Category, Product } from "@/server/queries/catalogue";

function matchesQuery(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return true;
  if (product.name.toLowerCase().includes(q)) return true;
  return product.search_keywords.some((keyword) =>
    keyword.toLowerCase().includes(q),
  );
}

/**
 * Client-side category filter + search + product grid + detail sheet.
 * Receives server-fetched data as props (Phase 4 §12: Server Components
 * own the fetch, client components own the interactivity) — this
 * component never fetches on its own.
 */
export function CatalogueBrowser({
  categories,
  products,
  supportPhone,
}: {
  categories: Category[];
  products: Product[];
  supportPhone: string | null;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openProduct, setOpenProduct] = useState<Product | null>(null);

  const visibleProducts = useMemo(
    () =>
      products
        .filter((p) => !activeCategory || p.category_id === activeCategory)
        .filter((p) => matchesQuery(p, query)),
    [products, activeCategory, query],
  );

  return (
    <div className="flex flex-col gap-4">
      <SearchBar value={query} onChange={setQuery} />

      {categories.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            aria-pressed={activeCategory === null}
            className={cn(
              "flex shrink-0 flex-col items-center gap-1.5 rounded-md border px-3 py-2 transition-colors",
              activeCategory === null
                ? "border-accent bg-accent-soft"
                : "border-border bg-surface",
            )}
          >
            <div className="bg-surface-2 flex h-10 w-10 items-center justify-center rounded-full">
              <LayoutGrid
                size={18}
                className={
                  activeCategory === null ? "text-accent" : "text-ink-soft"
                }
                aria-hidden="true"
              />
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                activeCategory === null ? "text-accent" : "text-ink",
              )}
            >
              All
            </span>
          </button>
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
        query.trim().length > 0 ? (
          <SearchEmptyState query={query.trim()} supportPhone={supportPhone} />
        ) : (
          <p className="text-ink-soft py-12 text-center text-sm">
            Nothing here yet.
          </p>
        )
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
