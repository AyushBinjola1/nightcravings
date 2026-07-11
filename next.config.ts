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

const nextConfig: NextConfig = {
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
};

export default nextConfig;
