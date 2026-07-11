import { Badge } from "@/components/ui/badge";
import type { Hostel } from "@/server/queries/catalogue";

/**
 * Phase 2 §1 — the single highest-anxiety question a new visitor has,
 * answered before they can even ask it. Server-rendered (this is a Server
 * Component, no "use client") so it's part of the critical first paint,
 * not a client-side fetch after the fact.
 *
 * The live "delivering in ~N min" estimate from real order history
 * (Phase 1's north star number) isn't computed yet — there's no order
 * data to average over until Stage 6 checkout has been live for a while.
 * Showing a fixed generic range here would be exactly the fabricated
 * precision Phase 2 §12 rules out, so this shows only what's actually true
 * right now: open/closed and the hostel's set hours.
 */
export function StatusBar({ hostel }: { hostel: Hostel }) {
  const isOpen = hostel.status === "open";

  return (
    <div className="border-border bg-surface flex items-center justify-between rounded-md border px-4 py-3">
      <div className="flex items-center gap-2">
        <Badge variant={isOpen ? "success" : "neutral"}>
          {isOpen
            ? "Open"
            : hostel.status === "maintenance"
              ? "Unavailable"
              : "Closed"}
        </Badge>
        <span className="text-ink-soft text-sm">{hostel.name}</span>
      </div>
      {hostel.opening_time && hostel.closing_time && (
        <span className="text-ink-soft font-mono text-xs">
          {hostel.opening_time.slice(0, 5)}–{hostel.closing_time.slice(0, 5)}
        </span>
      )}
    </div>
  );
}
