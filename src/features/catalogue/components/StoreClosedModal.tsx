"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Hostel } from "@/server/queries/catalogue";

const DISMISS_KEY = "nightcravings-closed-notice-dismissed";

function wasAlreadyDismissed(status: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(DISMISS_KEY) === status;
}

/**
 * Phase 2 §11 (Store Closed) — a one-time-per-session notice, not a
 * banner easy to miss or a hard wall that blocks browsing entirely:
 * "Browse Menu Anyway" dismisses it for the rest of this tab's session
 * (re-shows on a fresh visit, or if the store's status actually changes
 * — this only ever renders when `hostel.status !== "open"` in the
 * first place, decided by the server-rendered parent each request).
 * The open state reads sessionStorage lazily (not in an effect) — this
 * component is only ever mounted when the store is already closed, so
 * there's no SSR/client mismatch to race against, just the one real
 * question: has this tab already dismissed it.
 */
export function StoreClosedModal({ hostel }: { hostel: Hostel }) {
  const [open, setOpen] = useState(() => !wasAlreadyDismissed(hostel.status));

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, hostel.status);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && dismiss()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="bg-ink/50 fixed inset-0 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              aria-describedby="store-closed-description"
            >
              <motion.div
                className="border-border bg-paper fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 text-center shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18 }}
              >
                <div className="bg-accent-soft text-accent mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                  <Clock size={28} aria-hidden="true" />
                </div>
                <Dialog.Title className="font-display text-ink text-xl font-bold">
                  {hostel.status === "maintenance"
                    ? "TEMPORARILY UNAVAILABLE"
                    : "WE ARE CLOSED"}
                </Dialog.Title>
                <p
                  id="store-closed-description"
                  className="text-ink-soft mt-3 text-sm font-medium"
                >
                  {hostel.status === "maintenance"
                    ? "The store is offline for maintenance right now."
                    : "Our regular operating hours have ended for tonight."}
                </p>
                {hostel.opening_time && (
                  <p className="text-ink-soft mt-1 text-xs">
                    We&apos;ll open again at {hostel.opening_time.slice(0, 5)}.
                    See you then!
                  </p>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-5 w-full"
                  onClick={dismiss}
                >
                  Browse menu anyway
                </Button>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
