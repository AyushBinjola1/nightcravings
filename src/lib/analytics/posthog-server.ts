import { PostHog } from "posthog-node";

let client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!client) {
    client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

/**
 * Phase 4 §15 — order-critical events (order_placed,
 * payment_screenshot_uploaded) are captured server-side, inside the
 * Server Action that performs the mutation, not client-side — an ad
 * blocker or a closed tab must never make the funnel undercount a real
 * placed order.
 */
export function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): void {
  const posthog = getClient();
  if (!posthog) return;
  posthog.capture({ distinctId, event, properties });
}
