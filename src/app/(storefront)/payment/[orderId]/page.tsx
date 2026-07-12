import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PaymentForm } from "@/features/payment";
import { getCurrentHostel } from "@/server/queries/catalogue";
import {
  getHostelPaymentInfo,
  getPaymentForOrder,
} from "@/server/queries/payment";

export const metadata: Metadata = {
  title: "Payment — NightCravings",
};

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const [hostel, payment] = await Promise.all([
    getCurrentHostel(),
    getPaymentForOrder(orderId),
  ]);

  if (!payment) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16 text-center">
        <p className="text-ink-soft text-sm">
          We couldn&apos;t find that order&apos;s payment. Check the link, or
          contact the store if you already paid.
        </p>
      </main>
    );
  }

  // Already resolved — nothing to do here, send them to tracking instead
  // of showing a payment form for something already decided.
  if (payment.status !== "pending") {
    redirect(`/orders/${orderId}`);
  }

  const paymentInfo = hostel
    ? await getHostelPaymentInfo(hostel.id, hostel.name)
    : { upiId: null, upiNumber: null, qrDataUrl: null };

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="font-display text-ink mb-6 text-xl font-semibold">
        Pay ₹{payment.claimedAmount.toFixed(0)}
      </h1>
      <PaymentForm
        orderId={orderId}
        claimedAmount={payment.claimedAmount}
        upiId={paymentInfo.upiId}
        upiNumber={paymentInfo.upiNumber}
        upiQrUrl={paymentInfo.qrDataUrl}
      />
    </main>
  );
}
