"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCustomerProfileStore } from "@/stores/customer-profile";
import {
  customerProfileSchema,
  type CustomerProfileInput,
} from "@/lib/zod-schemas/customer-profile";

/**
 * Replaces the phone-OTP flow: no server call, no account, no code to
 * enter. Submitting just saves name/phone/room to this browser's
 * `localStorage` via `useCustomerProfileStore`, so Checkout (Phase 2 §7)
 * can prefill it next time on the same device — that's the entire scope
 * of "customer identity" in this product.
 */
export function CustomerProfileForm({
  onSaved,
}: {
  onSaved?: (profile: CustomerProfileInput) => void;
}) {
  const storedProfile = useCustomerProfileStore((state) => state.profile);
  const setProfile = useCustomerProfileStore((state) => state.setProfile);

  const fullNameFieldId = useId();
  const phoneFieldId = useId();
  const roomFieldId = useId();

  const form = useForm<CustomerProfileInput>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: storedProfile ?? {
      fullName: "",
      phone: "",
      roomNumber: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setProfile(values);
    onSaved?.(values);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={fullNameFieldId}
          className="text-ink text-sm font-medium"
        >
          Name
        </label>
        <input
          id={fullNameFieldId}
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(form.formState.errors.fullName)}
          aria-describedby={
            form.formState.errors.fullName
              ? `${fullNameFieldId}-error`
              : undefined
          }
          className="border-border bg-paper text-ink focus:border-accent rounded-md border px-3 py-2.5 outline-none"
          {...form.register("fullName")}
        />
        {form.formState.errors.fullName && (
          <p
            id={`${fullNameFieldId}-error`}
            role="alert"
            className="text-danger text-sm"
          >
            {form.formState.errors.fullName.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
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
            aria-invalid={Boolean(form.formState.errors.phone)}
            aria-describedby={
              form.formState.errors.phone ? `${phoneFieldId}-error` : undefined
            }
            className="text-ink w-full bg-transparent py-2.5 pr-3 outline-none"
            {...form.register("phone")}
          />
        </div>
        {form.formState.errors.phone && (
          <p
            id={`${phoneFieldId}-error`}
            role="alert"
            className="text-danger text-sm"
          >
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={roomFieldId} className="text-ink text-sm font-medium">
          Room number
        </label>
        <input
          id={roomFieldId}
          type="text"
          aria-invalid={Boolean(form.formState.errors.roomNumber)}
          aria-describedby={
            form.formState.errors.roomNumber
              ? `${roomFieldId}-error`
              : undefined
          }
          className="border-border bg-paper text-ink focus:border-accent rounded-md border px-3 py-2.5 outline-none"
          {...form.register("roomNumber")}
        />
        {form.formState.errors.roomNumber && (
          <p
            id={`${roomFieldId}-error`}
            role="alert"
            className="text-danger text-sm"
          >
            {form.formState.errors.roomNumber.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="bg-accent text-paper rounded-md px-4 py-2.5 font-medium transition-opacity"
      >
        Save
      </button>
    </form>
  );
}
