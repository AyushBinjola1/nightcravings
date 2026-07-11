import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderHistoryEntry = {
  orderId: string;
  placedAt: string;
  total: number;
};

type OrderHistoryState = {
  entries: OrderHistoryEntry[];
  addEntry: (entry: OrderHistoryEntry) => void;
};

/**
 * Phase 2 §10 — with no customer account, "order history" is this
 * browser's own record of orders it placed, saved to `localStorage`
 * alongside the customer profile. Newest first; a different device starts
 * empty, same tradeoff as `customer-profile.ts`.
 */
export const useOrderHistoryStore = create<OrderHistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({ entries: [entry, ...state.entries].slice(0, 50) })),
    }),
    { name: "nightcravings-order-history" },
  ),
);
