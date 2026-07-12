import type { Metadata } from "next";

import { BackLink } from "@/components/ui/back-link";
import { OrderHistoryList } from "@/features/orders";

export const metadata: Metadata = {
  title: "Your orders — NightCravings",
};

export default function OrderHistoryPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <BackLink href="/" label="Back to menu" />
      <h1 className="font-display text-ink mb-6 text-xl font-semibold">
        Your orders
      </h1>
      <OrderHistoryList />
    </main>
  );
}
