"use client";

import { useEffect } from "react";

/**
 * Registered only in production — registering a service worker in
 * development fights Next's own dev-server HMR/caching and is a common,
 * confusing source of "why isn't my change showing up" bugs.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.error("[pwa] service worker registration failed:", error);
    });
  }, []);

  return null;
}
