import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  todaysSales: number;
  todaysOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
};

/**
 * Phase 3 §1 — the dashboard's job is "is anything on fire right now,"
 * answered from real counts, never placeholder numbers. "Today" is a UTC
 * day boundary — this deployment has one hostel in one timezone; a real
 * per-hostel timezone column is a Stage 22 multi-hostel concern, not
 * invented here ahead of need.
 */
export async function getDashboardStats(
  hostelId: string,
): Promise<DashboardStats> {
  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("orders")
    .select("status, total")
    .eq("hostel_id", hostelId)
    .gte("created_at", startOfDay.toISOString());

  if (error) {
    console.error("[dashboard] getDashboardStats failed:", error.message);
    return {
      todaysSales: 0,
      todaysOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      averageOrderValue: 0,
    };
  }

  const nonCancelled = data.filter((o) => o.status !== "cancelled");
  const todaysSales = nonCancelled.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = data.filter(
    (o) => o.status === "awaiting_verification",
  ).length;
  const completedOrders = data.filter((o) => o.status === "delivered").length;
  const cancelledOrders = data.filter((o) => o.status === "cancelled").length;

  return {
    todaysSales,
    todaysOrders: data.length,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    averageOrderValue:
      nonCancelled.length > 0 ? todaysSales / nonCancelled.length : 0,
  };
}
