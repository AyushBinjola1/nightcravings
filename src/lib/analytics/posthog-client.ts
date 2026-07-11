"use client";

import posthog from "posthog-js";

let initialized = false;

/**
 * Phase 4 §15 — client-side capture for behavioral events (adds to cart,
 * search misses). Guarded: if the env vars aren't set, every call below is
 * a silent no-op rather than a crash, matching the same "degrade, don't
 * break" convention as Supabase in `lib/supabase/middleware.ts`.
 */
export function initPostHogClient(): void {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    capture_pageview: true,
    persistence: "localStorage",
  });
  initialized = true;
}

export function captureEvent(
  name: string,
  properties?: Record<string, unknown>,
): void {
  if (!initialized) return;
  posthog.capture(name, properties);
}
