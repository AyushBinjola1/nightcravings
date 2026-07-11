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
    // Overrides customerProfileSchema's own unconditional
    // `roomNumber.min(1)` — that constraint is right for the local
    // "save my profile" form, but here Pickup must be allowed to submit
    // an empty room number, with the .refine() below enforcing it only
    // for Room Delivery. Caught by a failing unit test
    // (tests/unit/zod-schemas.test.ts) before this ever reached checkout.
    profile: customerProfileSchema.extend({ roomNumber: z.string().trim() }),
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
