"use client";

import { useHostelOrdersRealtime } from "@/hooks/useHostelOrdersRealtime";

/** Renders nothing — keeps Analytics live the same way
 * `DashboardRealtimeRefresher` does, since both read from `orders`. */
export function AnalyticsRealtimeRefresher({ hostelId }: { hostelId: string }) {
  useHostelOrdersRealtime(hostelId);
  return null;
}
