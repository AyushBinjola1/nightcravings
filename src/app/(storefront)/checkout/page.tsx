import type { Metadata } from "next";

import { CheckoutForm } from "@/features/checkout";

export const metadata: Metadata = {
  title: "Checkout — NightCravings",
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="font-display text-ink mb-6 text-xl font-semibold">
        Checkout
      </h1>
      <CheckoutForm />
    </main>
  );
}
