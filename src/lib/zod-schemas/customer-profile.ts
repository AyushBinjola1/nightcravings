import { z } from "zod";

/**
 * Indian mobile numbers only, entered as 10 digits starting 6-9. Stored
 * only in the browser (`src/stores/customer-profile.ts`) — there is no
 * server-side account behind it, no OTP, no login of any kind. It exists
 * purely so Checkout (Phase 2 §7) can prefill a returning visitor's details
 * on the same device, and so an order has a name/phone/room to deliver to.
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const customerProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name"),
  phone: phoneSchema,
  roomNumber: z.string().trim().min(1, "Enter your room number"),
});
export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;
