"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

/**
 * Shared by the Owner Console's Order Queue and Dashboard (Phase 4 §10):
 * re-fetches server data via `router.refresh()` whenever any order for
 * this hostel changes, rather than each screen hand-rolling its own
 * `postgres_changes` subscription.
 */
export function useHostelOrdersRealtime(hostelId: string) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`hostel-orders-${hostelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `hostel_id=eq.${hostelId}`,
        },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hostelId, router]);
}
