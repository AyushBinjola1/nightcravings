"use server";

import { redirect } from "next/navigation";

import { actionError, actionOk, type ActionResult } from "@/lib/result";
import { checkStaffLoginLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { staffLoginSchema } from "@/lib/zod-schemas/auth";

/**
 * Staff-only. Customer identity is a browser-local profile, not a Supabase
 * Auth account — see `src/stores/customer-profile.ts` and
 * `src/features/auth/components/CustomerProfileForm.tsx`. There is no
 * customer sign-in Server Action to keep the checkout flow free of any
 * login step, per product direction.
 */

/**
 * Wraps a Server Action body so an unexpected failure (most commonly: no
 * Supabase project configured yet, per Stage 1/2's staged rollout) always
 * resolves to a typed `ActionResult` instead of an unhandled exception
 * reaching the client — the real error is logged server-side, the client
 * only ever sees a safe, generic message.
 */
async function runAuthAction<T>(
  fn: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    console.error("[auth action] unexpected failure:", error);
    return actionError("Something went wrong — please try again.");
  }
}

/**
 * Staff (owner/manager/inventory manager/delivery partner) sign-in via
 * email + password (Phase 4 §4). Rate-limited per Phase 4 §13: lockout
 * after repeated failures.
 */
export async function signInStaff(
  input: unknown,
): Promise<ActionResult<{ signedIn: true }>> {
  return runAuthAction(async () => {
    const parsed = staffLoginSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(
        parsed.error.issues[0]?.message ?? "Invalid credentials",
      );
    }

    const limit = await checkStaffLoginLimit(parsed.data.email);
    if (!limit.allowed) {
      return actionError(
        `Too many failed attempts — try again in ${Math.ceil(limit.retryAfterSeconds / 60)} min.`,
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return actionError("Incorrect email or password.");
    }

    return actionOk({ signedIn: true });
  });
}

export async function signOutStaff(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/console/login");
}
