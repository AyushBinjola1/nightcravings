import { existsSync } from "node:fs";
import path from "node:path";

import QRCode from "qrcode";

import { createClient } from "@/lib/supabase/server";
import { buildUpiUri } from "@/lib/upi";

/**
 * Drop a real QR export at one of these paths (e.g. from your UPI app's
 * "share QR" screen) and it's served as-is — no environment here can
 * read the bytes of an image pasted into chat, so a file on disk is the
 * only way to show your literal QR image rather than one generated from
 * your UPI id. Checked in order; first one found wins.
 */
const STATIC_QR_CANDIDATES = ["upi-qr.jpeg", "upi-qr.jpg", "upi-qr.png"];

function findStaticQrUrl(): string | null {
  for (const filename of STATIC_QR_CANDIDATES) {
    if (existsSync(path.join(process.cwd(), "public", filename))) {
      return `/${filename}`;
    }
  }
  return null;
}

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
  /**
   * Resolved in priority order: a real QR file dropped at
   * `public/upi-qr.png` (your literal, scanned image) → the hostel's own
   * uploaded image (`hostels.upi_qr_url`, if a Settings screen ever sets
   * one) → generated on the fly from the UPI id via the standard
   * `upi://pay` deep link. The generated fallback can never go stale the
   * way a stored image would if the UPI id changed but nobody
   * re-uploaded the picture — but a real file always wins when present.
   */
  qrDataUrl: string | null;
};

/**
 * Reads UPI id/number through the Vault-decrypting
 * `get_hostel_payment_info()` RPC (Stage 12) — there is no plain column
 * to select these from anymore.
 */
export async function getHostelPaymentInfo(
  hostelId: string,
  hostelName: string,
): Promise<HostelPaymentInfo> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_hostel_payment_info", {
    p_hostel_id: hostelId,
  });

  if (error || !data || data.length === 0) {
    if (error)
      console.error("[payment] getHostelPaymentInfo failed:", error.message);
    return { upiId: null, upiNumber: null, qrDataUrl: null };
  }

  const row = data[0];
  if (!row) return { upiId: null, upiNumber: null, qrDataUrl: null };

  const staticQrUrl = findStaticQrUrl();
  let qrDataUrl: string | null = null;
  if (staticQrUrl) {
    qrDataUrl = staticQrUrl;
  } else if (row.upi_qr_url) {
    qrDataUrl = row.upi_qr_url;
  } else if (row.upi_id) {
    try {
      qrDataUrl = await QRCode.toDataURL(buildUpiUri(row.upi_id, hostelName), {
        width: 320,
        margin: 2,
        color: { dark: "#241B36", light: "#FAF8FC" },
      });
    } catch (qrError) {
      console.error("[payment] QR generation failed:", qrError);
    }
  }

  return {
    upiId: row.upi_id,
    upiNumber: row.upi_number,
    qrDataUrl,
  };
}
