"use server";

import { redirect } from "next/navigation";

import { actionError, actionOk, type ActionResult } from "@/lib/result";
import { checkOtpRequestLimit, checkStaffLoginLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  requestOtpSchema,
  staffLoginSchema,
  toE164,
  verifyOtpSchema,
} from "@/lib/zod-schemas/auth";

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
 * Sends a 6-digit OTP to a customer's phone via Supabase Auth's phone
 * provider (Phase 4 §4). Rate-limited per Phase 4 §13 to blunt brute-force
 * OTP requests against a single number.
 */
export async function requestCustomerOtp(
  input: unknown,
): Promise<ActionResult<{ phone: string }>> {
  return runAuthAction(async () => {
    const parsed = requestOtpSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(
        parsed.error.issues[0]?.message ?? "Invalid phone number",
      );
    }

    const limit = await checkOtpRequestLimit(parsed.data.phone);
    if (!limit.allowed) {
      return actionError(
        `Too many attempts — try again in ${Math.ceil(limit.retryAfterSeconds / 60)} min.`,
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: toE164(parsed.data.phone),
    });

    if (error) {
      return actionError(error.message);
    }

    return actionOk({ phone: parsed.data.phone });
  });
}

/**
 * Verifies the OTP a customer received and establishes their session.
 * Supabase Auth itself rate-limits repeated wrong codes per phone number.
 */
export async function verifyCustomerOtp(
  input: unknown,
): Promise<ActionResult<{ verified: true }>> {
  return runAuthAction(async () => {
    const parsed = verifyOtpSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid code");
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      phone: toE164(parsed.data.phone),
      token: parsed.data.token,
      type: "sms",
    });

    if (error) {
      return actionError(
        error.message === "Token has expired or is invalid"
          ? "That code is wrong or has expired — request a new one."
          : error.message,
      );
    }

    return actionOk({ verified: true });
  });
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
  redirect("/login");
}
