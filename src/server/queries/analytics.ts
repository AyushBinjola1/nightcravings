import { createClient } from "@/lib/supabase/server";

export type RevenueByDay = { day: string; revenue: number; orderCount: number };
export type TopProduct = { productName: string; totalQuantity: number };

/** Phase 3 §7 — real aggregates via the RPCs in Stage 9's migration. */
export async function getRevenueByDay(
  hostelId: string,
  days = 7,
): Promise<RevenueByDay[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_revenue_by_day", {
    p_hostel_id: hostelId,
    p_days: days,
  });

  if (error) {
    console.error("[analytics] getRevenueByDay failed:", error.message);
    return [];
  }

  return data.map((row) => ({
    day: row.day,
    revenue: row.revenue,
    orderCount: row.order_count,
  }));
}

export async function getTopProducts(
  hostelId: string,
  limit = 5,
): Promise<TopProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_top_products", {
    p_hostel_id: hostelId,
    p_limit: limit,
  });

  if (error) {
    console.error("[analytics] getTopProducts failed:", error.message);
    return [];
  }

  return data.map((row) => ({
    productName: row.product_name,
    totalQuantity: row.total_quantity,
  }));
}
