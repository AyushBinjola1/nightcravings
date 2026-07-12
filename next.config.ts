import type { NextConfig } from "next";

/**
 * Product/category images are served from this project's own Supabase
 * Storage buckets (Phase 4 §7) — the hostname is derived from
 * NEXT_PUBLIC_SUPABASE_URL so it never has to be hardcoded or updated by
 * hand when the project changes.
 */
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

/**
 * Phase 4 §13 — security headers applied globally. CSP's connect-src is
 * scoped to exactly the origins this app talks to (Supabase, PostHog,
 * Sentry) rather than left open; img-src allows the Supabase Storage
 * origin (product photos) plus data: for the few inline SVG/data-URI
 * cases already in the codebase.
 */
const isDev = process.env.NODE_ENV !== "production";

const CSP_CONNECT_SOURCES = [
  "'self'",
  supabaseHostname ? `https://${supabaseHostname}` : "",
  supabaseHostname ? `wss://${supabaseHostname}` : "",
  "https://*.posthog.com",
  "https://*.sentry.io",
  // Turbopack's Fast Refresh dev overlay connects over a websocket —
  // dev-only, never present in the production CSP.
  isDev ? "ws://localhost:*" : "",
].filter(Boolean);

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' is required for Next's own hydration/inline scripts
  // (the theme-init script in layout.tsx). 'unsafe-eval' is dev-only: React
  // and Turbopack's Fast Refresh use eval() to reconstruct stack traces and
  // patch modules in development, but React itself never calls eval() in
  // production, so the real production CSP stays free of it.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseHostname ? `https://${supabaseHostname}` : ""}`,
  `connect-src ${CSP_CONNECT_SOURCES.join(" ")}`,
  "font-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // The dev-only route indicator ("N" badge, bottom-left) is disabled —
  // it isn't Next.js's real error reporting (that still shows compile/
  // runtime errors regardless), just the static route/prerender status
  // overlay, which this project doesn't rely on.
  devIndicators: false,
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
