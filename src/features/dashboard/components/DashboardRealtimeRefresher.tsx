"use client";

import { useHostelOrdersRealtime } from "@/hooks/useHostelOrdersRealtime";

/** Renders nothing — just keeps the Dashboard's tiles live (Phase 4 §10). */
export function DashboardRealtimeRefresher({ hostelId }: { hostelId: string }) {
  useHostelOrdersRealtime(hostelId);
  return null;
}
