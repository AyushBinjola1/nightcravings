import type { Metadata } from "next";

import { BackLink } from "@/components/ui/back-link";
import { CheckoutForm } from "@/features/checkout";
import { getCurrentHostel } from "@/server/queries/catalogue";

export const metadata: Metadata = {
  title: "Checkout — NightCravings",
};

export default async function CheckoutPage() {
  const hostel = await getCurrentHostel();

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <BackLink href="/" label="Back to menu" />
      <h1 className="font-display text-ink mb-6 text-xl font-semibold">
        Checkout
      </h1>
      <CheckoutForm
        isStoreOpen={hostel?.status === "open"}
        deliveryFee={hostel?.delivery_fee ?? 0}
        freeDeliveryThreshold={hostel?.free_delivery_threshold ?? 0}
      />
    </main>
  );
}
