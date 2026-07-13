"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, UploadCloud, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { submitPaymentProof } from "@/server/actions/payment";
import { useToastStore } from "@/stores/toast";

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
  const [fileName, setFileName] = useState<string | null>(null);
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

  const handleCustomUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="flex flex-col gap-6"
    >
      {upiQrUrl && (
        <>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="border-border/80 bg-surface/50 shadow-premium relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border p-6"
          >
            <div className="bg-night/5 pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full blur-xl filter" />

            <button
              type="button"
              onClick={() => setQrEnlarged(true)}
              className="border-border bg-paper relative aspect-square w-48 overflow-hidden rounded-2xl border p-3 shadow-md transition-shadow duration-300 hover:shadow-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- data: URI generated server-side, not an optimizable remote image */}
              <img
                src={upiQrUrl}
                alt="UPI QR code — tap to enlarge"
                width={192}
                height={192}
                className="h-full w-full object-contain"
              />
            </button>
            <span className="text-night mt-1 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
              <Sparkles size={10} /> Tap QR to enlarge code
            </span>
          </motion.div>

          <Sheet
            open={qrEnlarged}
            onOpenChange={setQrEnlarged}
            title="Scan to pay"
            contentClassName="flex flex-col items-center"
          >
            <div className="bg-paper border-border/60 mt-4 mb-6 rounded-3xl border p-4 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element -- data: URI generated server-side, not an optimizable remote image */}
              <img
                src={upiQrUrl}
                alt="UPI QR code"
                width={320}
                height={320}
                className="object-contain"
              />
            </div>
            <p className="text-ink-soft max-w-xs text-center text-xs font-medium">
              Scan this QR using any UPI app (GPay, PhonePe, Paytm) to complete
              payment of ₹{claimedAmount.toFixed(0)}
            </p>
          </Sheet>
        </>
      )}

      {/* Payment Credentials */}
      <div className="flex flex-col gap-3">
        <CopyRow label="UPI ID" value={upiId} />
        <CopyRow label="UPI number" value={upiNumber} />
        <CopyRow
          label="Exact Amount"
          value={`₹${claimedAmount.toFixed(0)}`}
          isAmount
        />
      </div>

      <form action={onSubmit} className="flex flex-col gap-6">
        <input type="hidden" name="orderId" value={orderId} />

        {/* Screenshot Upload Container */}
        <div className="flex flex-col gap-2">
          <label className="text-ink text-sm font-semibold tracking-tight">
            Upload Payment Screenshot
          </label>

          <input
            ref={fileInputRef}
            type="file"
            name="screenshot"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
              setFileName(file ? file.name : null);
            }}
            className="sr-only"
          />

          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleCustomUploadClick}
            className="border-border/80 hover:border-night bg-surface/30 hover:bg-surface/50 flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed p-6 text-center shadow-sm transition-all duration-300"
          >
            <div className="bg-surface-2 text-ink-soft rounded-full p-3">
              <UploadCloud size={20} />
            </div>
            <div>
              <p className="text-ink text-sm font-semibold">
                {fileName ?? "Choose a screenshot file"}
              </p>
              <p className="text-ink-soft mt-1 text-xs">
                Supports PNG, JPG or WebP (max 5MB)
              </p>
            </div>
          </motion.div>

          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, height: 0 }}
                animate={{ opacity: 1, scale: 1, height: "auto" }}
                exit={{ opacity: 0, scale: 0.95, height: 0 }}
                className="overflow-hidden pt-2"
              >
                <div className="border-border/60 bg-surface/40 relative inline-block rounded-2xl border p-2.5 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not an optimizable remote image */}
                  <img
                    src={preview}
                    alt="Selected payment screenshot preview"
                    className="max-h-40 rounded-xl object-contain"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Optional UTR ID */}
        <div className="flex flex-col gap-2">
          <label className="text-ink text-sm font-semibold tracking-tight">
            Transaction ID (optional UTR)
          </label>
          <Input
            name="transactionId"
            placeholder="12-digit number (e.g. 3124...)"
            className="bg-paper/60 focus:bg-paper focus:border-night focus:ring-night/10 rounded-full shadow-sm focus:ring-2"
          />
        </div>

        {formError && (
          <div className="bg-danger-soft/40 border-danger/10 text-danger flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold">
            <AlertCircle size={14} />
            <span>{formError}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="shadow-accent/25 w-full cursor-pointer rounded-full py-4 text-sm font-bold shadow-lg transition-transform active:scale-98"
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <span className="border-paper h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              <span>Verifying Payment Proof...</span>
            </div>
          ) : (
            "I've Transferred Money"
          )}
        </Button>
      </form>
    </motion.div>
  );
}

function CopyRow({
  label,
  value,
  isAmount = false,
}: {
  label: string;
  value: string | null;
  isAmount?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  return (
    <div className="border-border/60 bg-surface/30 hover:bg-surface/50 flex items-center justify-between rounded-2xl border px-4 py-3.5 shadow-sm transition-all">
      <div>
        <div className="text-ink-soft text-[10px] font-bold tracking-wider uppercase">
          {label}
        </div>
        <div
          className={cn(
            "text-ink mt-0.5 font-mono text-sm tabular-nums",
            isAmount ? "text-night text-base font-bold" : "font-semibold",
          )}
        >
          {value}
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value.replace("₹", ""));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all",
          copied
            ? "border-success bg-success/5 text-success"
            : "border-border/80 bg-paper text-ink hover:bg-surface-2",
        )}
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
      </motion.button>
    </div>
  );
}
