import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Sliding-window rate limiting per Phase 4 §13 — specifically named there
 * to blunt brute-force OTP guessing and order-spam. Both limiters degrade
 * to "allow" (never "deny") when Upstash isn't configured, so local
 * development works before that infrastructure exists — but every call
 * site logs a warning when running unlimited, so this is never silently
 * true in production.
 */
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/** Phase 4 §13: OTP requests limited to 5 per phone number per 15 minutes. */
const otpRequestLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "ratelimit:otp-request",
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

export function checkOtpRequestLimit(phone: string): Promise<RateLimitResult> {
  return check(otpRequestLimiter, phone, "OTP request limit");
}

export function checkStaffLoginLimit(email: string): Promise<RateLimitResult> {
  return check(staffLoginLimiter, email, "Staff login limit");
}
