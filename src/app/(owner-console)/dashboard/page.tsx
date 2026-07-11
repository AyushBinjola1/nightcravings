import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/features/auth/components/SignOutButton";

export const metadata: Metadata = {
  title: "Dashboard — NightCravings Owner Console",
};

/**
 * A real, working authentication check — not the Phase 3 §1 Dashboard,
 * which belongs to Stage 7 (Owner Console) and isn't built yet. This page
 * exists so Stage 2's sign-in flow has a genuine, verifiable destination
 * rather than a redirect to nowhere.
 */
export default async function DashboardPlaceholderPage() {
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
        This confirms Stage 2 authentication works end-to-end: the proxy
        redirected you here after sign-in, and would redirect you back to{" "}
        <code>/login</code> without a session. The real Owner Console dashboard
        (Phase 3 §1) is built in Stage 7.
      </p>
      <SignOutButton />
    </main>
  );
}
