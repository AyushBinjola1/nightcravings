"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { actionError, actionOk, type ActionResult } from "@/lib/result";
import { rejectPaymentSchema } from "@/lib/zod-schemas/order-queue";

async function runOrderAction(
  fn: () => Promise<ActionResult<{ ok: true }>>,
): Promise<ActionResult<{ ok: true }>> {
  try {
    const result = await fn();
    if (result.success) revalidatePath("/console/orders");
    return result;
  } catch (error) {
    console.error("[order-queue] unexpected failure:", error);
    return actionError("Something went wrong — please try again.");
  }
}

/**
 * Phase 3 §2/§3 — approving payment and confirming the order happen
 * together: there is no visible intermediate lane between "awaiting
 * verification" and "preparing" in the Owner Console UI, even though the
 * order_status enum models `confirmed` as its own value.
 */
export async function approvePayment(
  paymentId: string,
  orderId: string,
): Promise<ActionResult<{ ok: true }>> {
  return runOrderAction(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: "approved",
        verified_by: user?.id ?? null,
        verified_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (paymentError) {
      return actionError(paymentError.message);
    }

    const { error: orderError } = await supabase
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", orderId);

    if (orderError) {
      return actionError(orderError.message);
    }

    return actionOk({ ok: true });
  });
}

export async function rejectPayment(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  return runOrderAction(async () => {
    const parsed = rejectPaymentSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid request");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("payments")
      .update({
        status: "rejected",
        rejected_reason: parsed.data.reason,
        verified_by: user?.id ?? null,
        verified_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.paymentId);

    if (error) {
      return actionError(error.message);
    }

    return actionOk({ ok: true });
  });
}

export async function markOutForDelivery(
  orderId: string,
): Promise<ActionResult<{ ok: true }>> {
  return runOrderAction(async () => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: "out_for_delivery" })
      .eq("id", orderId);

    if (error) return actionError(error.message);
    return actionOk({ ok: true });
  });
}

export async function markDelivered(
  orderId: string,
): Promise<ActionResult<{ ok: true }>> {
  return runOrderAction(async () => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", orderId);

    if (error) return actionError(error.message);
    return actionOk({ ok: true });
  });
}
