/**
 * Client-side Sentry init (Phase 4 §14) — same env-var gate as
 * `instrumentation.ts`, so this is a genuine no-op with no DSN configured
 * rather than a broken init call.
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.2,
      // Session replay is scoped to the Owner Console only, per Phase 4
      // §15 — never on the customer app, where it's a privacy cost with
      // no matched benefit. Enabling it here would require distinguishing
      // routes at init time; deferred until a Sentry project exists to
      // configure sampling against.
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
  });
}
