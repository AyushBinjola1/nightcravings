import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type OrderTracking = {
  id: string;
  status: Database["public"]["Enums"]["order_status"];
  deliveryMethod: Database["public"]["Enums"]["delivery_method"];
  total: number;
  createdAt: string;
  updatedAt: string;
  paymentStatus: Database["public"]["Enums"]["payment_status"] | null;
};

/** Capability-URL read, same pattern as getPaymentForOrder. */
export async function getOrderTracking(
  orderId: string,
): Promise<OrderTracking | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_order_tracking", {
    p_order_id: orderId,
  });

  if (error || !data || data.length === 0) {
    if (error)
      console.error("[tracking] getOrderTracking failed:", error.message);
    return null;
  }

  const row = data[0];
  if (!row) return null;

  return {
    id: row.id,
    status: row.status,
    deliveryMethod: row.delivery_method,
    total: row.total,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paymentStatus: row.payment_status,
  };
}
