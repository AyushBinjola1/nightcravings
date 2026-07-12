"use client";

import { cn } from "@/lib/cn";
import type { Category } from "@/server/queries/catalogue";

/** Phase 2 §1/§3 — a scannable row of category filters, text-only so the
 * label itself (not a photo) is what's scanned in under two seconds. */
export function CategoryTile({
  category,
  isActive,
  onSelect,
}: {
  category: Category;
  isActive: boolean;
  onSelect: (categoryId: string | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(isActive ? null : category.id)}
      aria-pressed={isActive}
      className={cn(
        "shrink-0 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "border-accent bg-accent-soft text-accent"
          : "border-border bg-surface text-ink",
      )}
    >
      {category.name}
    </button>
  );
}
