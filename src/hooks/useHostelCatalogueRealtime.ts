"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

/**
 * Keeps the customer-facing catalogue (stock levels, new/hidden
 * products) and the Owner Console's Manage Menu live — a product going
 * out of stock, or a staff edit from another tab, previously only
 * appeared after a manual reload.
 */
export function useHostelCatalogueRealtime(hostelId: string) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`hostel-catalogue-${hostelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: `hostel_id=eq.${hostelId}`,
        },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_history" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hostelId, router]);
}
