import type { Metadata } from "next";

/**
 * Overrides the root layout's manifest link for every `/console/*` route
 * — the Owner Console installs as its own separate PWA (Phase 4 §17), not
 * as another shortcut to the customer app.
 */
export const metadata: Metadata = {
  manifest: "/console-manifest",
};

export default function OwnerConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
