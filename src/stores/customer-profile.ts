import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CustomerProfileInput } from "@/lib/zod-schemas/customer-profile";

type CustomerProfileState = {
  profile: CustomerProfileInput | null;
  setProfile: (profile: CustomerProfileInput) => void;
  clearProfile: () => void;
};

/**
 * The customer's entire "identity" in this product: a name, phone, and
 * room number, saved to `localStorage` on this device only. There is no
 * account, no OTP, no server-side session behind it — product direction is
 * that Checkout (Phase 2 §7) must never have a login step. This store
 * exists purely to prefill the form for a returning visitor on the same
 * browser; a different device starts with nothing saved, by design.
 */
export const useCustomerProfileStore = create<CustomerProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    { name: "nightcravings-customer-profile" },
  ),
);
