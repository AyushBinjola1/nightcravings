import { z } from "zod";

import { customerProfileSchema } from "@/lib/zod-schemas/customer-profile";

/**
 * Checkout (Phase 2 §7) — room number is the only "address" field that
 * exists; delivery method and the customer's saved local profile are the
 * only other inputs. Pickup doesn't require a room number, so that field
 * is validated conditionally below rather than always-required.
 */
export const cartLineSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const placeOrderSchema = z
  .object({
    profile: customerProfileSchema,
    deliveryMethod: z.enum(["room_delivery", "pickup"]),
    notes: z.string().trim().max(280).optional(),
    items: z.array(cartLineSchema).min(1, "Your cart is empty"),
  })
  .refine(
    (data) =>
      data.deliveryMethod === "pickup" || data.profile.roomNumber.length > 0,
    { message: "Enter your room number", path: ["profile", "roomNumber"] },
  );

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
