"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
      <Field label="Name" error={form.formState.errors.fullName?.message}>
        {({ fieldId, describedBy }) => (
          <Input
            id={fieldId}
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(form.formState.errors.fullName)}
            aria-describedby={describedBy}
            {...form.register("fullName")}
          />
        )}
      </Field>

      <Field label="Phone number" error={form.formState.errors.phone?.message}>
        {({ fieldId, describedBy }) => (
          <div className="border-border bg-paper focus-within:border-accent flex items-center gap-2 rounded-md border">
            <span className="text-ink-soft pl-3 font-mono text-sm">+91</span>
            <input
              id={fieldId}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              aria-invalid={Boolean(form.formState.errors.phone)}
              aria-describedby={describedBy}
              className="text-ink w-full bg-transparent py-2.5 pr-3 outline-none"
              {...form.register("phone")}
            />
          </div>
        )}
      </Field>

      <Field
        label="Room number"
        error={form.formState.errors.roomNumber?.message}
      >
        {({ fieldId, describedBy }) => (
          <Input
            id={fieldId}
            type="text"
            aria-invalid={Boolean(form.formState.errors.roomNumber)}
            aria-describedby={describedBy}
            {...form.register("roomNumber")}
          />
        )}
      </Field>

      <Button type="submit">Save</Button>
    </form>
  );
}
