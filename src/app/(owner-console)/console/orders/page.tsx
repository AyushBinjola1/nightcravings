import type { Metadata } from "next";

import { BackLink } from "@/components/ui/back-link";
import { OrderQueueBoard } from "@/features/order-queue";
import { getCurrentHostel } from "@/server/queries/catalogue";
import { getOrderQueue } from "@/server/queries/order-queue";

export const metadata: Metadata = {
  title: "Order Queue — NightCravings Owner Console",
};

/** Phase 3 §2 — the most important screen in the Owner Console. */
export default async function OrderQueuePage() {
  const hostel = await getCurrentHostel();

  if (!hostel) {
    return (
      <main className="text-ink-soft mx-auto max-w-xl px-6 py-16 text-center text-sm">
        Store not found — apply the Stage 3 migrations first (see README.md).
      </main>
    );
  }

  const orders = await getOrderQueue(hostel.id);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <BackLink href="/console/dashboard" label="Dashboard" />
      <h1 className="font-display text-ink mb-4 text-xl font-semibold">
        Order Queue
      </h1>
      <OrderQueueBoard hostelId={hostel.id} orders={orders} />
    </main>
  );
}
