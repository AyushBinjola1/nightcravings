"use server";

import { createClient } from "@/lib/supabase/server";
import { actionError, actionOk, type ActionResult } from "@/lib/result";
import { placeOrderSchema } from "@/lib/zod-schemas/checkout";
import { CURRENT_HOSTEL_SLUG } from "@/config/hostel";

/**
 * Places a guest order: upserts the (hostel_id, phone)-keyed customer
 * record, snapshots delivery details onto the order, creates the order
 * items, and opens a pending payment row for it — all in the sense of one
 * logical checkout, even though Supabase's JS client doesn't expose
 * multi-statement transactions (each insert relies on its own RLS check
 * passing; a failure partway through is reported, not silently ignored).
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

    const { data: customer } = await supabase
      .from("customers")
      .upsert(
        {
          hostel_id: hostel.id,
          phone: profile.phone,
          full_name: profile.fullName,
          room_number: profile.roomNumber || null,
        },
        { onConflict: "hostel_id,phone" },
      )
      .select("id")
      .single();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        hostel_id: hostel.id,
        customer_id: customer?.id ?? null,
        customer_name: profile.fullName,
        customer_phone: profile.phone,
        room_number:
          deliveryMethod === "room_delivery" ? profile.roomNumber : null,
        delivery_method: deliveryMethod,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("[checkout] order insert failed:", orderError?.message);
      return actionError("Could not place your order — please try again.");
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
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
      order_id: order.id,
      claimed_amount: total,
    });

    if (paymentError) {
      console.error("[checkout] payment insert failed:", paymentError.message);
      return actionError(
        "Your order was created but payment setup failed — contact the store.",
      );
    }

    return actionOk({ orderId: order.id });
  } catch (error) {
    console.error("[checkout] placeOrder unexpected failure:", error);
    return actionError("Something went wrong — please try again.");
  }
}
