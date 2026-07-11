import { z } from "zod";

/**
 * Phase 2 §8 — screenshot is required (this business's only real proof of
 * payment); transaction ID is optional since not every UPI app surfaces it
 * cleanly.
 */
export const submitPaymentProofSchema = z.object({
  orderId: z.string().uuid(),
  transactionId: z.string().trim().max(64).optional(),
});
export type SubmitPaymentProofInput = z.infer<typeof submitPaymentProofSchema>;

export const ACCEPTED_SCREENSHOT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_SCREENSHOT_BYTES = 8 * 1024 * 1024;
