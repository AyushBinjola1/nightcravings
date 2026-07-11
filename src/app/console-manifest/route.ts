import type { MetadataRoute } from "next";

/**
 * The Owner Console's own PWA manifest, separate from the customer app's
 * (`app/manifest.ts`) — Next's `manifest.ts` file convention only covers
 * the app root, so a second app-shell manifest has to be a Route Handler
 * instead, with the correct `application/manifest+json` content type set
 * explicitly (a static file under `public/` with a `.webmanifest`
 * extension risks being served with an unrecognized MIME type instead).
 * Linked from `app/(owner-console)/layout.tsx` via `metadata.manifest`.
 */
export const dynamic = "force-static";

export function GET() {
  const manifest: MetadataRoute.Manifest = {
    name: "NightCravings Owner Console",
    short_name: "NC Console",
    description: "Run NightCravings — orders, payments, and the nightly queue.",
    start_url: "/console/dashboard",
    display: "standalone",
    background_color: "#171310",
    theme_color: "#2e2a6e",
    icons: [
      {
        src: "/icons/icon-console-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-console-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-console-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Order Queue",
        url: "/console/orders",
        description: "Jump straight to the live order queue",
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
