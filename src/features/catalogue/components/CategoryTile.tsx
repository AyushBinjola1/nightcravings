"use client";

import Image from "next/image";

import { cn } from "@/lib/cn";
import type { Category } from "@/server/queries/catalogue";

/** Phase 2 §1/§3 — photo-led, scannable in under two seconds. */
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
        "flex shrink-0 flex-col items-center gap-1.5 rounded-md border px-3 py-2 transition-colors",
        isActive ? "border-accent bg-accent-soft" : "border-border bg-surface",
      )}
    >
      <div className="bg-surface-2 relative h-10 w-10 overflow-hidden rounded-full">
        {category.icon_url && (
          <Image
            src={category.icon_url}
            alt=""
            fill
            sizes="40px"
            className="object-cover"
          />
        )}
      </div>
      <span
        className={cn(
          "text-xs font-medium",
          isActive ? "text-accent" : "text-ink",
        )}
      >
        {category.name}
      </span>
    </button>
  );
}
