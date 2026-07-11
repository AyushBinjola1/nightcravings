"use server";

import { createClient } from "@/lib/supabase/server";
import { actionError, actionOk, type ActionResult } from "@/lib/result";
import { CURRENT_HOSTEL_SLUG } from "@/config/hostel";
import {
  submitPaymentProofSchema,
  ACCEPTED_SCREENSHOT_TYPES,
  MAX_SCREENSHOT_BYTES,
} from "@/lib/zod-schemas/payment";

/**
 * Phase 2 §8 — uploads the payment screenshot to the private
 * `payment-screenshots` bucket (path convention: hostel_id/order_id/uuid.ext,
 * matched by the storage.objects RLS policy) and records it against the
 * order's payment row. Duplicate-screenshot perceptual hashing (Phase 3 §3)
 * is not implemented here — that's a background Edge Function job
 * (Phase 4 §8), explicitly out of scope for this Server Action.
 */
export async function submitPaymentProof(
  formData: FormData,
): Promise<ActionResult<{ submitted: true }>> {
  try {
    const parsed = submitPaymentProofSchema.safeParse({
      orderId: formData.get("orderId"),
      transactionId: formData.get("transactionId") || undefined,
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid request");
    }

    const file = formData.get("screenshot");
    if (!(file instanceof File) || file.size === 0) {
      return actionError("Upload a screenshot of your payment.");
    }
    if (
      !ACCEPTED_SCREENSHOT_TYPES.includes(
        file.type as (typeof ACCEPTED_SCREENSHOT_TYPES)[number],
      )
    ) {
      return actionError("Upload a JPEG, PNG, or WebP image.");
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      return actionError("That image is too large (max 8MB).");
    }

    const supabase = await createClient();

    const { data: hostel } = await supabase
      .from("hostels")
      .select("id")
      .eq("slug", CURRENT_HOSTEL_SLUG)
      .maybeSingle();

    if (!hostel) {
      return actionError("Store not found.");
    }

    const { data: paymentRows, error: paymentLookupError } = await supabase.rpc(
      "get_payment_for_order",
      { p_order_id: parsed.data.orderId },
    );

    const payment = paymentRows?.[0];
    if (paymentLookupError || !payment) {
      return actionError("Could not find that order's payment.");
    }

    const extension = file.type.split("/")[1] ?? "jpg";
    const path = `${hostel.id}/${parsed.data.orderId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("payment-screenshots")
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      console.error("[payment] screenshot upload failed:", uploadError.message);
      return actionError("Upload failed — please try again.");
    }

    const { error: insertError } = await supabase
      .from("payment_screenshots")
      .insert({ payment_id: payment.id, storage_path: path });

    if (insertError) {
      console.error(
        "[payment] payment_screenshots insert failed:",
        insertError.message,
      );
      return actionError(
        "Your screenshot uploaded but couldn't be attached — contact the store.",
      );
    }

    if (parsed.data.transactionId) {
      const { error: rpcError } = await supabase.rpc("submit_transaction_id", {
        p_order_id: parsed.data.orderId,
        p_transaction_id: parsed.data.transactionId,
      });

      if (rpcError) {
        // Non-fatal — the screenshot is already attached, the transaction
        // ID is a secondary signal (Phase 2 §8).
        console.error(
          "[payment] submit_transaction_id failed:",
          rpcError.message,
        );
      }
    }

    return actionOk({ submitted: true });
  } catch (error) {
    console.error("[payment] submitPaymentProof unexpected failure:", error);
    return actionError("Something went wrong — please try again.");
  }
}
