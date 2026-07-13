"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="flex flex-col gap-6">
      <SearchBar value={query} onChange={setQuery} />

      {categories.length > 0 && (
        <div className="-mx-4 flex scrollbar-thin gap-2.5 overflow-x-auto px-4 pb-2.5">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            type="button"
            onClick={() => setActiveCategory(null)}
            aria-pressed={activeCategory === null}
            className={cn(
              "shrink-0 rounded-full border px-5 py-2.5 text-xs font-medium shadow-sm transition-all sm:text-sm",
              activeCategory === null
                ? "border-accent bg-accent text-paper shadow-glow-gold"
                : "border-border bg-surface/60 text-ink hover:bg-surface-2/80 hover:border-ink-soft/30",
            )}
          >
            All
          </motion.button>
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
          <p className="text-ink-soft py-16 text-center text-sm font-medium">
            Nothing here yet.
          </p>
        )
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {visibleProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                }}
              >
                <ProductCard product={product} onOpenDetail={setOpenProduct} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <ProductSheet
        product={openProduct}
        onClose={() => setOpenProduct(null)}
      />
    </div>
  );
}
