"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { useToastStore, type ToastVariant } from "@/stores/toast";
import { cn } from "@/lib/cn";

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  night: CheckCircle2,
};

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "border-success/30 text-success",
  warning: "border-warning/30 text-warning",
  danger: "border-danger/30 text-danger",
  night: "border-night/30 text-night",
};

/** Mounted once in the root layout — every toast in the app renders here. */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            message={toast.message}
            variant={toast.variant}
            onDismiss={dismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  id,
  message,
  variant,
  onDismiss,
}: {
  id: string;
  message: string;
  variant: ToastVariant;
  onDismiss: (id: string) => void;
}) {
  const Icon = ICONS[variant];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-paper text-ink pointer-events-auto flex max-w-sm items-center gap-2 rounded-md border px-4 py-3 text-sm shadow-md",
        VARIANT_CLASSES[variant],
      )}
    >
      <Icon size={16} aria-hidden="true" className="shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}
