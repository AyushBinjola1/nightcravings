"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToastStore } from "@/stores/toast";
import { updateHostelSettings } from "@/server/actions/hostel-settings";
import { hostelSettingsSchema } from "@/lib/zod-schemas/hostel-settings";
import type { Hostel } from "@/server/queries/catalogue";

type FormInput = z.input<typeof hostelSettingsSchema>;
type FormOutput = z.output<typeof hostelSettingsSchema>;

const STATUS_OPTIONS = [
  { value: "open", label: "Open", hint: "Taking orders normally." },
  {
    value: "closed",
    label: "Closed",
    hint: "Customers see a closed notice; ordering is blocked.",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    hint: "Same as closed, for planned downtime.",
  },
] as const;

/** Phase 3 §5 — the only place any of this is editable: store status,
 * hours, and delivery pricing. Every field here is read live by the
 * customer-facing Home page and Checkout. */
export function HostelSettingsForm({ hostel }: { hostel: Hostel }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(hostelSettingsSchema),
    defaultValues: {
      hostelId: hostel.id,
      status: hostel.status,
      openingTime: hostel.opening_time?.slice(0, 5) ?? "18:00",
      closingTime: hostel.closing_time?.slice(0, 5) ?? "02:00",
      deliveryFee: hostel.delivery_fee,
      freeDeliveryThreshold: hostel.free_delivery_threshold,
    },
  });

  const status = useWatch({ control: form.control, name: "status" });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateHostelSettings(values);
      if (!result.success) {
        form.setError("root", { message: result.error });
        return;
      }
      useToastStore.getState().show("Store settings updated", "success");
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <span className="text-ink mb-1.5 block text-sm font-medium">
          Store status
        </span>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {STATUS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-md border px-3 py-3 text-center text-sm font-medium ${
                status === option.value
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-ink"
              }`}
            >
              <input
                type="radio"
                value={option.value}
                className="sr-only"
                {...form.register("status")}
              />
              {option.label}
            </label>
          ))}
        </div>
        <p className="text-ink-soft mt-1.5 text-xs">
          {STATUS_OPTIONS.find((o) => o.value === status)?.hint}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Opens at"
          error={form.formState.errors.openingTime?.message}
        >
          {({ fieldId, describedBy }) => (
            <Input
              id={fieldId}
              type="time"
              aria-describedby={describedBy}
              {...form.register("openingTime")}
            />
          )}
        </Field>
        <Field
          label="Closes at"
          error={form.formState.errors.closingTime?.message}
        >
          {({ fieldId, describedBy }) => (
            <Input
              id={fieldId}
              type="time"
              aria-describedby={describedBy}
              {...form.register("closingTime")}
            />
          )}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Delivery fee (₹)"
          error={form.formState.errors.deliveryFee?.message}
        >
          {({ fieldId, describedBy }) => (
            <Input
              id={fieldId}
              type="number"
              step="1"
              min="0"
              aria-describedby={describedBy}
              {...form.register("deliveryFee")}
            />
          )}
        </Field>
        <Field
          label="Free delivery above (₹)"
          error={form.formState.errors.freeDeliveryThreshold?.message}
        >
          {({ fieldId, describedBy }) => (
            <Input
              id={fieldId}
              type="number"
              step="1"
              min="0"
              aria-describedby={describedBy}
              {...form.register("freeDeliveryThreshold")}
            />
          )}
        </Field>
      </div>

      {form.formState.errors.root && (
        <p role="alert" className="text-danger text-sm">
          {form.formState.errors.root.message}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
