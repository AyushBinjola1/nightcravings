"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";

import { ProfileSheet } from "@/features/profile";

/**
 * Phase 2 §1's Home "Top Navigation" (logo + cart, "nothing else") applied
 * across every storefront screen, not just Home — Checkout/Payment/Orders
 * had no way back and no Profile entry point at all before this. The cart
 * icon itself stays out of this bar: `CartBar` (Phase 2 §6) already owns
 * that job as a persistent floating bar wherever the cart is non-empty, so
 * duplicating it here would just be two cart affordances fighting for
 * attention.
 */
export function HeaderBar({ supportPhone }: { supportPhone: string | null }) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header className="border-border bg-paper/95 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="font-display text-ink text-lg font-semibold"
          >
            Night<span className="text-accent">Cravings</span>
          </Link>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile"
            className="text-ink-soft hover:bg-surface hover:text-ink rounded-full p-2"
          >
            <CircleUserRound size={22} aria-hidden="true" />
          </button>
        </div>
      </header>
      <ProfileSheet
        open={profileOpen}
        onOpenChange={setProfileOpen}
        supportPhone={supportPhone}
      />
    </>
  );
}
