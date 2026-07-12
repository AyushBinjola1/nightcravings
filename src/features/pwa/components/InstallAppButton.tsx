"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Only ever renders when the browser has actually fired
 * `beforeinstallprompt` (Chromium-based browsers that judge the PWA
 * installable and not already installed) — there's no fallback "Get App"
 * button that does nothing on Safari/Firefox, since that would just be a
 * dead control.
 */
export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferredPrompt) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
      }}
      className="border-border text-ink-soft hover:text-ink flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
    >
      <Download size={14} aria-hidden="true" />
      Get App
    </button>
  );
}
