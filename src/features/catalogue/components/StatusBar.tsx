import { Badge } from "@/components/ui/badge";
import type { Hostel } from "@/server/queries/catalogue";

export function StatusBar({ hostel }: { hostel: Hostel }) {
  const isOpen = hostel.status === "open";

  return (
    <div className="border-border/60 bg-surface/50 shadow-premium relative overflow-hidden rounded-2xl border p-5">
      <div className="from-night/5 pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l to-transparent" />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3.5 w-3.5 items-center justify-center">
            {isOpen && (
              <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                isOpen ? "bg-success" : "bg-ink-soft/40"
              }`}
            />
          </div>
          <div>
            <h2 className="text-ink flex items-center gap-2 text-sm font-semibold sm:text-base">
              {hostel.name}
            </h2>
            <p className="text-ink-soft text-xs font-medium">
              {isOpen
                ? "⚡ Standard Room Delivery: 10-15 mins"
                : "Currently Closed"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hostel.opening_time && hostel.closing_time && (
            <div className="text-ink-soft bg-surface-2/70 border-border/30 flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs">
              <span>🕒</span>
              <span>
                {hostel.opening_time.slice(0, 5)}–
                {hostel.closing_time.slice(0, 5)}
              </span>
            </div>
          )}
          <Badge
            variant={isOpen ? "success" : "neutral"}
            className="hidden sm:inline-flex"
          >
            {isOpen
              ? "Accepting Orders"
              : hostel.status === "maintenance"
                ? "Maintenance"
                : "Closed"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
