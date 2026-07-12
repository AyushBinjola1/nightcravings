import type { Metadata } from "next";

import { BackLink } from "@/components/ui/back-link";
import { OrderTracker } from "@/features/orders";
import { getOrderTracking } from "@/server/queries/tracking";

export const metadata: Metadata = {
  title: "Your order — NightCravings",
};

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderTracking(orderId);

  if (!order) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16 text-center">
        <p className="text-ink-soft text-sm">
          We couldn&apos;t find that order. Check the link you were sent.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <BackLink href="/" label="Back to menu" />
      <h1 className="font-display text-ink mb-6 text-xl font-semibold">
        Your order
      </h1>
      <OrderTracker initial={order} />
    </main>
  );
}
