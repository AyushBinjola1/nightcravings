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

export type HostelPaymentInfo = {
  upiId: string | null;
  upiNumber: string | null;
  upiQrUrl: string | null;
};

/**
 * Reads UPI id/number through the Vault-decrypting
 * `get_hostel_payment_info()` RPC (Stage 12) — there is no plain column
 * to select these from anymore.
 */
export async function getHostelPaymentInfo(
  hostelId: string,
): Promise<HostelPaymentInfo> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_hostel_payment_info", {
    p_hostel_id: hostelId,
  });

  if (error || !data || data.length === 0) {
    if (error)
      console.error("[payment] getHostelPaymentInfo failed:", error.message);
    return { upiId: null, upiNumber: null, upiQrUrl: null };
  }

  const row = data[0];
  if (!row) return { upiId: null, upiNumber: null, upiQrUrl: null };

  return {
    upiId: row.upi_id,
    upiNumber: row.upi_number,
    upiQrUrl: row.upi_qr_url,
  };
}
