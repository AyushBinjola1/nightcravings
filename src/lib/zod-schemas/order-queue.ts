import { z } from "zod";

export const rejectPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  reason: z.enum(["wrong_amount", "duplicate", "unreadable", "other"]),
});
export type RejectPaymentInput = z.infer<typeof rejectPaymentSchema>;
