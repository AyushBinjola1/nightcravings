"use client";

import { useId, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { requestCustomerOtp, verifyCustomerOtp } from "@/server/actions/auth";
import {
  requestOtpSchema,
  verifyOtpSchema,
  type RequestOtpInput,
  type VerifyOtpInput,
} from "@/lib/zod-schemas/auth";

/**
 * Reusable phone-OTP sign-in, built in Stage 2 so the underlying
 * Supabase Auth flow exists and is exercised end-to-end — Phase 2 has no
 * standalone customer login screen, since verification is meant to happen
 * silently inside Checkout (Phase 2 §7). Stage 6 composes this component
 * into that flow rather than duplicating the request/verify logic.
 *
 * Not yet end-to-end testable without a live Supabase project with the
 * phone provider configured — see docs/README.md.
 */
export function PhoneOtpForm({
  onVerified,
}: {
  onVerified: (phone: string) => void;
}) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const phoneFieldId = useId();
  const codeFieldId = useId();
  const errorId = useId();

  const phoneForm = useForm<RequestOtpInput>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { phone: "" },
  });

  const codeForm = useForm<Omit<VerifyOtpInput, "phone">>({
    resolver: zodResolver(verifyOtpSchema.omit({ phone: true })),
    defaultValues: { token: "" },
  });

  const onRequestOtp = phoneForm.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await requestCustomerOtp(values);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setPhone(result.data.phone);
      setStep("code");
    });
  });

  const onVerify = codeForm.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await verifyCustomerOtp({ phone, token: values.token });
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      onVerified(phone);
    });
  });

  if (step === "phone") {
    return (
      <form onSubmit={onRequestOtp} noValidate className="flex flex-col gap-3">
        <label htmlFor={phoneFieldId} className="text-ink text-sm font-medium">
          Phone number
        </label>
        <div className="border-border bg-paper focus-within:border-accent flex items-center gap-2 rounded-md border">
          <span className="text-ink-soft pl-3 font-mono text-sm">+91</span>
          <input
            id={phoneFieldId}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98765 43210"
            aria-invalid={Boolean(phoneForm.formState.errors.phone)}
            aria-describedby={
              phoneForm.formState.errors.phone || formError
                ? errorId
                : undefined
            }
            className="text-ink w-full bg-transparent py-2.5 pr-3 outline-none"
            {...phoneForm.register("phone")}
          />
        </div>
        {(phoneForm.formState.errors.phone ?? formError) && (
          <p id={errorId} role="alert" className="text-danger text-sm">
            {phoneForm.formState.errors.phone?.message ?? formError}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="bg-accent text-paper rounded-md px-4 py-2.5 font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sending code…" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onVerify} noValidate className="flex flex-col gap-3">
      <label htmlFor={codeFieldId} className="text-ink text-sm font-medium">
        Enter the 6-digit code sent to +91 {phone}
      </label>
      <input
        id={codeFieldId}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        aria-invalid={Boolean(codeForm.formState.errors.token)}
        aria-describedby={
          codeForm.formState.errors.token || formError ? errorId : undefined
        }
        className="border-border bg-paper text-ink focus:border-accent w-full rounded-md border px-3 py-2.5 text-center font-mono text-lg tracking-[0.3em] outline-none"
        {...codeForm.register("token")}
      />
      {(codeForm.formState.errors.token ?? formError) && (
        <p id={errorId} role="alert" className="text-danger text-sm">
          {codeForm.formState.errors.token?.message ?? formError}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="bg-accent text-paper rounded-md px-4 py-2.5 font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Verifying…" : "Verify"}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep("phone");
          setFormError(null);
        }}
        className="text-ink-soft text-sm underline underline-offset-2"
      >
        Use a different number
      </button>
    </form>
  );
}
