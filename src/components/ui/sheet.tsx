"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

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
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 640;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="bg-ink/40 fixed inset-0 z-40 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className={cn(
                  "border-border bg-paper/95 fixed z-50 overflow-y-auto shadow-2xl backdrop-blur-md transition-all duration-200",
                  // Mobile bottom sheet
                  "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t p-5",
                  // Desktop side drawer override
                  "sm:inset-y-0 sm:top-0 sm:right-0 sm:bottom-0 sm:left-auto sm:max-h-screen sm:w-[440px] sm:rounded-l-3xl sm:rounded-tr-none sm:border-t-0 sm:border-l sm:p-6",
                  contentClassName,
                )}
                initial={isDesktop ? { x: "100%" } : { y: "100%" }}
                animate={isDesktop ? { x: 0 } : { y: 0 }}
                exit={isDesktop ? { x: "100%" } : { y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 350 }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <Dialog.Title className="font-display text-ink text-xl font-bold tracking-tight">
                    {title}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Close"
                      className="text-ink-soft hover:text-ink hover:bg-surface-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors"
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
