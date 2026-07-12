"use client";

import { Search, X } from "lucide-react";

/** Phase 2 §2 (Search) — a plain text filter over the already-loaded
 * catalogue, no separate fetch. */
export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="border-border bg-paper focus-within:border-accent flex items-center gap-2 rounded-md border px-3 py-2.5">
      <Search size={16} className="text-ink-soft shrink-0" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search snacks, drinks, Maggi…"
        aria-label="Search products"
        className="text-ink placeholder:text-ink-soft w-full bg-transparent text-sm outline-none"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-ink-soft hover:text-ink shrink-0"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
