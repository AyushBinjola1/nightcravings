import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/features/auth/components/SignOutButton";

export const metadata: Metadata = {
  title: "Dashboard — NightCravings Owner Console",
};

/**
 * The full Phase 3 §1 Dashboard (sales tiles, low-stock list, revenue
 * sparkline) needs orders/inventory data flowing for at least a day to be
 * meaningful — deferred past this pass. This page is still real: it
 * confirms who's signed in and is the one link every other Owner Console
 * screen assumes exists.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-16">
      <p className="text-accent mb-3 font-mono text-xs tracking-[0.1em] uppercase">
        NightCravings — Owner Console
      </p>
      <h1 className="font-display text-ink mb-3 text-2xl font-semibold text-balance">
        Signed in as {user?.email}.
      </h1>
      <p className="text-ink-soft mb-8 max-w-[60ch]">
        The full sales/inventory dashboard (Phase 3 §1) needs a day of real
        order data to be meaningful. The Order Queue below is live now.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/console/orders"
          className="bg-accent text-paper rounded-md px-4 py-2.5 text-sm font-medium"
        >
          Open Order Queue
        </Link>
        <SignOutButton />
      </div>
    </main>
  );
}
