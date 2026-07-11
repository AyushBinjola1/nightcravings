import { z } from "zod";

/**
 * Indian mobile numbers only, entered as 10 digits starting 6-9 — the
 * customer's true identity (Phase 4 §4). The leading `+91` is added at the
 * Supabase call site, never asked of the user (Phase 2's 30-second-order
 * promise doesn't survive a country-code picker).
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  token: otpSchema,
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

/**
 * Staff (owner/manager/inventory manager/delivery partner) sign-in —
 * email + password, per Phase 4 §4's reasoning: staff log in far less
 * often than a customer orders, typically from a remembered device.
 */
export const staffLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;

/** Converts a validated 10-digit number to the E.164 form Supabase expects. */
export function toE164(phone: string): string {
  return `+91${phone}`;
}
