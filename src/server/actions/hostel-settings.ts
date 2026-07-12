"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { actionError, actionOk, type ActionResult } from "@/lib/result";
import { hostelSettingsSchema } from "@/lib/zod-schemas/hostel-settings";

/**
 * Phase 3 §5 — Store Settings. RLS (`hostels_update_staff`, requires
 * `settings.write`) is the real authorization boundary; this action just
 * shapes the update. Revalidates both the console screen and the
 * customer-facing Home page, since hours/status/delivery pricing show
 * up on both.
 */
export async function updateHostelSettings(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  try {
    const parsed = hostelSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("hostels")
      .update({
        status: parsed.data.status,
        opening_time: parsed.data.openingTime,
        closing_time: parsed.data.closingTime,
        delivery_fee: parsed.data.deliveryFee,
        free_delivery_threshold: parsed.data.freeDeliveryThreshold,
      })
      .eq("id", parsed.data.hostelId);

    if (error) {
      return actionError(error.message);
    }

    revalidatePath("/console/settings");
    revalidatePath("/");
    return actionOk({ ok: true });
  } catch (error) {
    console.error(
      "[hostel-settings] updateHostelSettings unexpected failure:",
      error,
    );
    return actionError("Something went wrong — please try again.");
  }
}
