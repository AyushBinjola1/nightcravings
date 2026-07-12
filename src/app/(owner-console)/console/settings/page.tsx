import type { Metadata } from "next";

import { BackLink } from "@/components/ui/back-link";
import { HostelSettingsForm } from "@/features/settings";
import { getCurrentHostel } from "@/server/queries/catalogue";

export const metadata: Metadata = {
  title: "Store Settings — NightCravings Owner Console",
};

/** Phase 3 §5 — open/close the store, set hours, and set delivery
 * pricing. Previously there was no screen for any of this at all. */
export default async function SettingsPage() {
  const hostel = await getCurrentHostel();

  if (!hostel) {
    return (
      <main className="text-ink-soft mx-auto max-w-xl px-6 py-16 text-center text-sm">
        Store not found — apply the Stage 3 migrations first (see README.md).
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <BackLink href="/console/dashboard" label="Dashboard" />
      <h1 className="font-display text-ink mb-4 text-xl font-semibold">
        Store Settings
      </h1>
      <HostelSettingsForm hostel={hostel} />
    </main>
  );
}
