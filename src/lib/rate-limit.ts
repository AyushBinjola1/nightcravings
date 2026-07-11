import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Sliding-window rate limiting per Phase 4 §13. Degrades to "allow" (never
 * "deny") when Upstash isn't configured, so local development works before
 * that infrastructure exists — but every call site logs a warning when
 * running unlimited, so this is never silently true in production.
 */
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/** Phase 4 §13: staff login lockout after 10 failed attempts per hour. */
const staffLoginLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "ratelimit:staff-login",
    })
  : null;

/** Phase 4 §13: order-spam guard — 10 orders per phone number per hour. */
const placeOrderLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "ratelimit:place-order",
    })
  : null;

/** Phase 4 §13: payment-proof spam guard — 15 uploads per order per hour
 * (generous — a genuine customer might retry a failed upload a few times,
 * but this stops a scripted flood against one order's screenshot bucket). */
const paymentProofLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(15, "1 h"),
      prefix: "ratelimit:payment-proof",
    })
  : null;

export type RateLimitResult =
  { allowed: true } | { allowed: false; retryAfterSeconds: number };

async function check(
  limiter: Ratelimit | null,
  key: string,
  label: string,
): Promise<RateLimitResult> {
  if (!limiter) {
    console.warn(
      `[rate-limit] ${label} is running unlimited — UPSTASH_REDIS_REST_URL/TOKEN not set.`,
    );
    return { allowed: true };
  }

  const result = await limiter.limit(key);
  if (result.success) {
    return { allowed: true };
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );
  return { allowed: false, retryAfterSeconds };
}

export function checkStaffLoginLimit(email: string): Promise<RateLimitResult> {
  return check(staffLoginLimiter, email, "Staff login limit");
}

export function checkPlaceOrderLimit(phone: string): Promise<RateLimitResult> {
  return check(placeOrderLimiter, phone, "Place order limit");
}

export function checkPaymentProofLimit(
  orderId: string,
): Promise<RateLimitResult> {
  return check(paymentProofLimiter, orderId, "Payment proof limit");
}
