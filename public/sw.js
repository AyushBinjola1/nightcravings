// NightCravings service worker (Phase 4 §17).
//
// Deliberately minimal, to avoid the well-known class of bugs where a
// custom service worker fights Next.js's own data caching: it only
// intercepts two safe cases and lets everything else — including every
// Server Action POST, every Supabase Realtime/Storage/RPC call, and the
// checkout/payment pages themselves — pass straight to the network,
// untouched. Phase 4 §17 is explicit that money-moving requests must
// never be served from cache or allowed to silently queue as if they'd
// succeeded; the simplest way to guarantee that is to never intercept
// them in the first place.
const CACHE_NAME = "nightcravings-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon-customer-192.png",
  "/icons/icon-customer-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only ever handle same-origin GETs — never a Server Action POST, never
  // a cross-origin Supabase call.
  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  // Static build assets: cache-first, they're content-hashed and immutable.
  if (
    request.url.includes("/_next/static/") ||
    request.url.includes("/icons/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request)),
    );
    return;
  }

  // Page navigations: network-first (always prefer live data), falling
  // back to the offline page only when there's truly no connection —
  // never a stale cached page presented as current.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
});
