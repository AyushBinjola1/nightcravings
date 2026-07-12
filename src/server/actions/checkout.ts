"use server";

import { createClient } from "@/lib/supabase/server";
import { actionError, actionOk, type ActionResult } from "@/lib/result";
import { captureServerEvent } from "@/lib/analytics/posthog-server";
import { checkPlaceOrderLimit } from "@/lib/rate-limit";
import { placeOrderSchema } from "@/lib/zod-schemas/checkout";
import { CURRENT_HOSTEL_SLUG } from "@/config/hostel";

/**
 * Places a guest order: upserts the (hostel_id, phone)-keyed customer
 * record, snapshots delivery details onto the order, creates the order
 * items, and opens a pending payment row for it — all in the sense of one
 * logical checkout, even though Supabase's JS client doesn't expose
 * multi-statement transactions (each insert relies on its own RLS check
 * passing; a failure partway through is reported, not silently ignored).
 *
 * Neither `orders` nor `customers` has an anon SELECT policy (both hold
 * PII no other customer should be able to read), so this never chains
 * `.select()` after an insert/upsert on them — that chain makes
 * supabase-js ask Postgres to return the written row, which fails RLS
 * even though the write itself was allowed. The order id is generated
 * here instead of read back; the customer id comes from the
 * `upsert_customer` RPC, a narrow SECURITY DEFINER function that returns
 * only the id.
 */
export async function placeOrder(
  input: unknown,
): Promise<ActionResult<{ orderId: string }>> {
  try {
    const parsed = placeOrderSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid order");
    }
    const { profile, deliveryMethod, notes, items } = parsed.data;

    const limit = await checkPlaceOrderLimit(profile.phone);
    if (!limit.allowed) {
      return actionError(
        `Too many orders from this number — try again in ${Math.ceil(limit.retryAfterSeconds / 60)} min.`,
      );
    }

    const supabase = await createClient();

    const { data: hostel, error: hostelError } = await supabase
      .from("hostels")
      .select("id, delivery_fee, free_delivery_threshold")
      .eq("slug", CURRENT_HOSTEL_SLUG)
      .maybeSingle();

    if (hostelError || !hostel) {
      return actionError("Store not found.");
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const deliveryFee =
      deliveryMethod === "pickup" || subtotal >= hostel.free_delivery_threshold
        ? 0
        : hostel.delivery_fee;
    const total = subtotal + deliveryFee;

    const { data: customerId, error: customerError } = await supabase.rpc(
      "upsert_customer",
      {
        p_hostel_id: hostel.id,
        p_phone: profile.phone,
        p_full_name: profile.fullName,
        p_room_number: profile.roomNumber,
      },
    );

    if (customerError) {
      console.error(
        "[checkout] upsert_customer failed:",
        customerError.message,
      );
    }

    const orderId = crypto.randomUUID();
    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      hostel_id: hostel.id,
      customer_id: customerId ?? null,
      customer_name: profile.fullName,
      customer_phone: profile.phone,
      room_number:
        deliveryMethod === "room_delivery" ? profile.roomNumber : null,
      delivery_method: deliveryMethod,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      notes: notes || null,
    });

    if (orderError) {
      console.error("[checkout] order insert failed:", orderError.message);
      return actionError("Could not place your order — please try again.");
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        product_name_snapshot: item.name,
        unit_price_snapshot: item.price,
        quantity: item.quantity,
      })),
    );

    if (itemsError) {
      console.error(
        "[checkout] order_items insert failed:",
        itemsError.message,
      );
      return actionError(
        "Your order was created but items failed to save — contact the store.",
      );
    }

    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: orderId,
      claimed_amount: total,
    });

    if (paymentError) {
      console.error("[checkout] payment insert failed:", paymentError.message);
      return actionError(
        "Your order was created but payment setup failed — contact the store.",
      );
    }

    // Server-side capture (Phase 4 §15): a closed tab or an ad blocker
    // must never make the conversion funnel undercount a real order.
    captureServerEvent(profile.phone, "order_placed", {
      orderId,
      total,
      itemCount: items.length,
      deliveryMethod,
    });

    return actionOk({ orderId });
  } catch (error) {
    console.error("[checkout] placeOrder unexpected failure:", error);
    return actionError("Something went wrong — please try again.");
  }
}
