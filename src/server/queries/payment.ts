import { createClient } from "@/lib/supabase/server";

export type PaymentSummary = {
  id: string;
  status: "pending" | "approved" | "rejected" | "refunded";
  claimedAmount: number;
};

/** Capability-URL read (see the migration's header comment) — no auth. */
export async function getPaymentForOrder(
  orderId: string,
): Promise<PaymentSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_payment_for_order", {
    p_order_id: orderId,
  });

  if (error || !data || data.length === 0) {
    if (error)
      console.error("[payment] getPaymentForOrder failed:", error.message);
    return null;
  }

  const row = data[0];
  if (!row) return null;

  return {
    id: row.id,
    status: row.status,
    claimedAmount: row.claimed_amount,
  };
}
