"use client";

import { useCallback, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "nightcravings-theme";

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

function applyTheme(preference: ThemePreference) {
  if (preference === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", preference);
  }
}

/**
 * Phase 2 §10 (Profile) — the three-way Light / Dark / System switch. The
 * "system" case is simply the absence of `data-theme`, letting
 * `globals.css`'s `prefers-color-scheme` block take over — same mechanism
 * the inline script in `app/layout.tsx` already reads on first paint. The
 * initial state reads `localStorage` lazily (not in an effect) since the
 * root layout's inline script has already applied the `data-theme`
 * attribute before this component ever mounts — this just needs to match
 * it, not race it.
 */
export function useTheme() {
  const [preference, setPreference] =
    useState<ThemePreference>(readStoredPreference);

  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next);
    if (next === "system") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, next);
    }
    applyTheme(next);
  }, []);

  return { preference, setTheme };
}
