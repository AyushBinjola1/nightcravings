"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { submitPaymentProof } from "@/server/actions/payment";
import { useToastStore } from "@/stores/toast";

/**
 * Phase 2 §8 — the highest-trust-risk screen in the product: no gateway
 * confirms anything automatically, a human on the other end has to see
 * the money land. Every control here exists to remove one specific
 * real-world failure mode of manual UPI (a small QR, a mistyped amount,
 * uncertainty the upload worked) — see the field-by-field comments below.
 */
export function PaymentForm({
  orderId,
  claimedAmount,
  upiId,
  upiNumber,
  upiQrUrl,
}: {
  orderId: string;
  claimedAmount: number;
  upiId: string | null;
  upiNumber: string | null;
  upiQrUrl: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [qrEnlarged, setQrEnlarged] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (formData: FormData) => {
    setFormError(null);
    startTransition(async () => {
      const result = await submitPaymentProof(formData);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      useToastStore.getState().show("Payment details submitted", "success");
      router.push(`/orders/${orderId}`);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {upiQrUrl && (
        <>
          <button
            type="button"
            onClick={() => setQrEnlarged(true)}
            className="border-border mx-auto block w-48 overflow-hidden rounded-md border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URI generated server-side, not an optimizable remote image */}
            <img
              src={upiQrUrl}
              alt="UPI QR code — tap to enlarge"
              width={192}
              height={192}
            />
          </button>
          <Sheet
            open={qrEnlarged}
            onOpenChange={setQrEnlarged}
            title="Scan to pay"
            contentClassName="flex flex-col items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URI generated server-side, not an optimizable remote image */}
            <img src={upiQrUrl} alt="UPI QR code" width={320} height={320} />
          </Sheet>
        </>
      )}

      <CopyRow label="UPI ID" value={upiId} />
      <CopyRow label="UPI number" value={upiNumber} />
      <CopyRow label="Amount" value={`₹${claimedAmount.toFixed(0)}`} />

      <form action={onSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="orderId" value={orderId} />

        <div>
          <label className="text-ink mb-1.5 block text-sm font-medium">
            Payment screenshot
          </label>
          <input
            ref={fileInputRef}
            type="file"
            name="screenshot"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            required
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
            className="text-ink-soft file:bg-accent file:text-paper block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not an optimizable remote image
            <img
              src={preview}
              alt="Selected payment screenshot preview"
              className="border-border mt-2 max-h-48 rounded-md border"
            />
          )}
        </div>

        <div>
          <label className="text-ink mb-1.5 block text-sm font-medium">
            Transaction ID (optional)
          </label>
          <Input name="transactionId" />
        </div>

        {formError && (
          <p role="alert" className="text-danger text-sm">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting…" : "I've paid"}
        </Button>
      </form>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  return (
    <div className="border-border bg-surface flex items-center justify-between rounded-md border px-3 py-2.5">
      <div>
        <div className="text-ink-soft text-xs">{label}</div>
        <div className="text-ink font-mono text-sm tabular-nums">{value}</div>
      </div>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="border-border text-ink flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium"
      >
        {copied ? (
          <>
            <Check size={12} aria-hidden="true" /> Copied
          </>
        ) : (
          <>
            <Copy size={12} aria-hidden="true" /> Copy
          </>
        )}
      </button>
    </div>
  );
}
