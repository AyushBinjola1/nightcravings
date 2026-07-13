"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { Category } from "@/server/queries/catalogue";

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
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      type="button"
      onClick={() => onSelect(isActive ? null : category.id)}
      aria-pressed={isActive}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border px-5 py-2.5 text-xs font-medium shadow-sm transition-all sm:text-sm",
        isActive
          ? "border-accent bg-accent text-paper shadow-glow-gold"
          : "border-border bg-surface/60 text-ink hover:bg-surface-2/80 hover:border-ink-soft/30",
      )}
    >
      <span className="relative z-10">{category.name}</span>
    </motion.button>
  );
}
