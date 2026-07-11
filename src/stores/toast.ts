import { create } from "zustand";

export type ToastVariant = "success" | "warning" | "danger" | "night";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastState = {
  toasts: Toast[];
  show: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
};

/**
 * Toast state (Phase 2 §15, §18) — a calm state-change confirmation, never
 * a celebration. Components call `useToastStore.getState().show(...)`
 * directly (including from Server Action callbacks) rather than needing a
 * context provider.
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, variant = "success") =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), message, variant }],
    })),
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
