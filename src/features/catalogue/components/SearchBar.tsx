"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== inputRef.current) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="border-border bg-surface/50 focus-within:bg-paper focus-within:border-night focus-within:shadow-premium focus-within:ring-night/10 flex items-center gap-3 rounded-full border px-4 py-3 transition-all duration-300 focus-within:ring-2">
      <Search
        size={18}
        className="text-ink-soft shrink-0 transition-colors"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search late-night cravings (snacks, drinks, Maggi...)"
        aria-label="Search products"
        className="text-ink placeholder:text-ink-soft/70 w-full bg-transparent text-sm font-medium outline-none"
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-ink-soft hover:text-ink shrink-0 transition-colors"
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : (
        <kbd className="text-ink-soft bg-surface-2 border-border hidden items-center gap-0.5 rounded border px-1.5 py-0.5 font-mono text-[10px] sm:flex">
          /
        </kbd>
      )}
    </div>
  );
}
