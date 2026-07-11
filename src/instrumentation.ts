import type { Instrumentation } from "next";

/**
 * Server + edge Sentry init (Phase 4 §14), gated by env var — a missing
 * DSN means no-op, not a startup failure. No `withSentryConfig` wrapper in
 * next.config.ts: that plugin uploads source maps at build time and needs
 * a `SENTRY_AUTH_TOKEN` this environment doesn't have; wiring it
 * unconditionally would either fail the build or silently skip upload.
 * This file gives real error capture without that dependency — add the
 * config-wrapper + auth token once a Sentry project actually exists.
 */
export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.2,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.2,
    });
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
) => {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(err, request, {
    routerKind: "App Router",
    routePath: request.path,
    routeType: "render",
  });
};
