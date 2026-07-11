import { z } from "zod";

/**
 * Staff (owner/manager/inventory manager/delivery partner) sign-in —
 * email + password, per Phase 4 §4's reasoning: staff log in far less
 * often than a customer orders, typically from a remembered device.
 *
 * Customers never authenticate at all — see
 * `src/lib/zod-schemas/customer-profile.ts`.
 */
export const staffLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
