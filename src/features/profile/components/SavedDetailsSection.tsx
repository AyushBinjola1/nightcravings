"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  customerProfileSchema,
  type CustomerProfileInput,
} from "@/lib/zod-schemas/customer-profile";
import { useCustomerProfileStore } from "@/stores/customer-profile";
import { useToastStore } from "@/stores/toast";

/**
 * Phase 2 §10 (Profile) "Saved Details" row — room number and phone,
 * "set once, needed nowhere else again." Edits the same
 * `customer-profile` store Checkout reads from, so a change here prefills
 * the next order too.
 */
export function SavedDetailsSection() {
  const profile = useCustomerProfileStore((state) => state.profile);
  const setProfile = useCustomerProfileStore((state) => state.setProfile);
  const clearProfile = useCustomerProfileStore((state) => state.clearProfile);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<CustomerProfileInput>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: profile ?? { fullName: "", phone: "", roomNumber: "" },
  });

  if (!profile && !isEditing) {
    return (
      <p className="text-ink-soft text-sm">
        Nothing saved yet — this fills in automatically after your first order.
      </p>
    );
  }

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-ink text-sm">
          <div className="font-medium">{profile?.fullName}</div>
          <div className="text-ink-soft">
            +91 {profile?.phone} · Room {profile?.roomNumber}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              clearProfile();
              form.reset({ fullName: "", phone: "", roomNumber: "" });
            }}
          >
            Clear
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = form.handleSubmit((values) => {
    setProfile(values);
    setIsEditing(false);
    useToastStore.getState().show("Saved details updated", "success");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <Field label="Name" error={form.formState.errors.fullName?.message}>
        {({ fieldId, describedBy }) => (
          <Input
            id={fieldId}
            autoComplete="name"
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
            aria-describedby={describedBy}
            {...form.register("roomNumber")}
          />
        )}
      </Field>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
