import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves Tailwind conflicts (e.g.
 * `cn("px-2", isWide && "px-4")` keeps only `px-4`) — used by every
 * component in `components/ui` so variant props never fight a caller's
 * override.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
