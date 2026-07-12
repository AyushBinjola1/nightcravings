import { z } from "zod";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Phase 3 §5 — Store Settings: open/closed status, hours, and delivery
 * pricing. Hours are plain `HH:MM` (24h) — the same format the `<input
 * type="time">` control already produces natively. */
export const hostelSettingsSchema = z.object({
  hostelId: z.string().uuid(),
  status: z.enum(["open", "closed", "maintenance"]),
  openingTime: z.string().regex(TIME_PATTERN, "Enter a valid time"),
  closingTime: z.string().regex(TIME_PATTERN, "Enter a valid time"),
  deliveryFee: z.coerce.number().min(0, "Enter a delivery fee"),
  freeDeliveryThreshold: z.coerce
    .number()
    .min(0, "Enter a free-delivery threshold"),
});
export type HostelSettingsInput = z.infer<typeof hostelSettingsSchema>;
