import type { MetadataRoute } from "next";

/**
 * Customer PWA manifest (Phase 4 §17). The Owner Console has its own,
 * separate manifest (`public/console-manifest.webmanifest`, linked via
 * `metadata.manifest` in `app/(owner-console)/layout.tsx`) — Next's
 * `manifest.ts` convention only covers the app root, so the second app
 * can't be generated the same way and is a static file instead.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NightCravings",
    short_name: "NightCravings",
    description:
      "The premium late-night convenience store inside every hostel.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8fc",
    theme_color: "#8a5d07",
    icons: [
      {
        src: "/icons/icon-customer-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-customer-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-customer-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Reorder",
        url: "/orders",
        description: "Jump to your most recent order",
      },
    ],
  };
}
