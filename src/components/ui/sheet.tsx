"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * The bottom-sheet primitive behind Product Detail (Phase 2 §5) and Cart
 * (Phase 2 §6) — Radix Dialog underneath for focus trapping, Escape-to-
 * close, and screen-reader semantics; Framer Motion for the 220ms
 * slide-up/backdrop-dim (Phase 2 §5's animation spec). Desktop layout
 * variants (e.g. Cart becoming a side panel) are applied by the caller via
 * `contentClassName`, not baked in here — the two screens have different
 * desktop shapes but the same open/close mechanics.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  contentClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="bg-ink/40 fixed inset-0 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className={cn(
                  "border-border bg-paper fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-xl border-t p-5 shadow-xl",
                  contentClassName,
                )}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title className="font-display text-ink text-lg font-semibold">
                    {title}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Close"
                      className="text-ink-soft hover:bg-surface rounded-full p-1.5"
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
