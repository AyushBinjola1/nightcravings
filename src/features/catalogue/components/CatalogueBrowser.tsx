"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import { useHostelCatalogueRealtime } from "@/hooks/useHostelCatalogueRealtime";
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
  hostelId,
  categories,
  products,
  supportPhone,
}: {
  hostelId: string;
  categories: Category[];
  products: Product[];
  supportPhone: string | null;
}) {
  useHostelCatalogueRealtime(hostelId);
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
              "shrink-0 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors",
              activeCategory === null
                ? "border-accent bg-accent-soft text-accent"
                : "border-border bg-surface text-ink",
            )}
          >
            All
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
