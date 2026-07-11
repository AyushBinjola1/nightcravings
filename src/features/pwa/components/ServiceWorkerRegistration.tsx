"use client";

import { useEffect } from "react";

/**
 * Registered only in production — registering a service worker in
 * development fights Next's own dev-server HMR/caching and is a common,
 * confusing source of "why isn't my change showing up" bugs.
 *
 * In development, this actively unregisters any service worker already
 * present for this origin instead of just skipping registration. Without
 * this, a service worker registered during an earlier `npm run start`
 * (production) visit silently outlives that server: it's origin-scoped,
 * not tied to which mode the server currently happens to be running in.
 * The visible symptom is exactly the one that prompted this fix — the
 * offline.html fallback appearing on a working `npm run dev` because a
 * stale worker intercepted the navigation and swallowed the real
 * connection error.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            void registration.unregister();
          }
        })
        .catch((error: unknown) => {
          console.error("[pwa] service worker cleanup failed:", error);
        });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.error("[pwa] service worker registration failed:", error);
    });
  }, []);

  return null;
}
