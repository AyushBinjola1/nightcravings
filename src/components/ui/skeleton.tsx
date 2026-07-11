import { cn } from "@/lib/cn";

/**
 * A plain pulse, not a shimmer sweep — per Phase 2 §12/§15, a shimmer reads
 * as "slow," a fade/pulse reads as "arrived." Respects
 * `prefers-reduced-motion` via the `motion-reduce:animate-none` utility.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-surface-2 animate-pulse rounded-md motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
