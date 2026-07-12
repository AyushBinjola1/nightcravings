import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type OrderQueueRow = {
  id: string;
  customerName: string;
  customerPhone: string;
  roomNumber: string | null;
  deliveryMethod: Database["public"]["Enums"]["delivery_method"];
  status: Database["public"]["Enums"]["order_status"];
  total: number;
  notes: string | null;
  createdAt: string;
  items: { name: string; quantity: number }[];
  payment: {
    id: string;
    status: Database["public"]["Enums"]["payment_status"];
    claimedAmount: number;
    transactionId: string | null;
    screenshotUrl: string | null;
  } | null;
};

const ACTIVE_STATUSES: Database["public"]["Enums"]["order_status"][] = [
  "awaiting_verification",
  "confirmed",
  "preparing",
  "out_for_delivery",
];

/** Signed URLs are short-lived on purpose — the bucket is private
 * (Phase 4 §7), and the queue is realtime-refreshed anyway, so there's
 * no reason to hand out a longer-lived link than one page view needs. */
const SCREENSHOT_SIGNED_URL_TTL_SECONDS = 300;

/**
 * Phase 3 §2 — the three-lane Order Queue's data source, oldest-first
 * within each lane (the query's own `order` clause, not a client-side
 * sort — Phase 3 §2 has no manual sort control because none is ever
 * correct here).
 */
export async function getOrderQueue(
  hostelId: string,
): Promise<OrderQueueRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, customer_name, customer_phone, room_number, delivery_method, status, total, notes, created_at, order_items(product_name_snapshot, quantity), payments(id, status, claimed_amount, transaction_id, payment_screenshots(storage_path))",
    )
    .eq("hostel_id", hostelId)
    .in("status", ACTIVE_STATUSES)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[order-queue] getOrderQueue failed:", error.message);
    return [];
  }

  return Promise.all(
    data.map(async (row) => {
      const payment = Array.isArray(row.payments)
        ? row.payments[0]
        : row.payments;

      let screenshotUrl: string | null = null;
      const screenshot = payment?.payment_screenshots?.[0];
      if (screenshot) {
        const { data: signed } = await supabase.storage
          .from("payment-screenshots")
          .createSignedUrl(
            screenshot.storage_path,
            SCREENSHOT_SIGNED_URL_TTL_SECONDS,
          );
        screenshotUrl = signed?.signedUrl ?? null;
      }

      return {
        id: row.id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        roomNumber: row.room_number,
        deliveryMethod: row.delivery_method,
        status: row.status,
        total: row.total,
        notes: row.notes,
        createdAt: row.created_at,
        items: row.order_items.map((item) => ({
          name: item.product_name_snapshot,
          quantity: item.quantity,
        })),
        payment: payment
          ? {
              id: payment.id,
              status: payment.status,
              claimedAmount: payment.claimed_amount,
              transactionId: payment.transaction_id,
              screenshotUrl,
            }
          : null,
      };
    }),
  );
}
