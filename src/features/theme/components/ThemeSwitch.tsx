"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/cn";
import { useTheme, type ThemePreference } from "@/features/theme/useTheme";

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

/** Phase 2 §10 (Profile) "Theme" row — Light / Dark / System, a plain
 * three-way switch. */
export function ThemeSwitch() {
  const { preference, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="border-border grid grid-cols-3 gap-1 rounded-md border p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <label
          key={value}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-1 rounded-sm py-2 text-xs font-medium",
            preference === value
              ? "bg-accent-soft text-accent"
              : "text-ink-soft hover:bg-surface",
          )}
        >
          <input
            type="radio"
            name="theme"
            value={value}
            checked={preference === value}
            onChange={() => setTheme(value)}
            className="sr-only"
          />
          <Icon size={16} aria-hidden="true" />
          {label}
        </label>
      ))}
    </div>
  );
}
