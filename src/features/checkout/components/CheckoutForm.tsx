"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { placeOrder } from "@/server/actions/checkout";
import {
  placeOrderSchema,
  type PlaceOrderInput,
} from "@/lib/zod-schemas/checkout";
import { useCartStore, cartSubtotal } from "@/stores/cart";
import { useCustomerProfileStore } from "@/stores/customer-profile";
import { useOrderHistoryStore } from "@/stores/order-history";

/**
 * Phase 2 §7 — exactly two required fields (room number, phone), a
 * two-card delivery method choice, and an optional note. No address form,
 * no payment method picker (UPI is the only option, handled on the next
 * screen), no login of any kind.
 */
export function CheckoutForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const storedProfile = useCustomerProfileStore((state) => state.profile);
  const setProfile = useCustomerProfileStore((state) => state.setProfile);
  const addHistoryEntry = useOrderHistoryStore((state) => state.addEntry);

  const form = useForm<PlaceOrderInput>({
    resolver: zodResolver(placeOrderSchema),
    defaultValues: {
      profile: storedProfile ?? { fullName: "", phone: "", roomNumber: "" },
      deliveryMethod: "room_delivery",
      notes: "",
      items,
    },
  });

  const deliveryMethod = useWatch({
    control: form.control,
    name: "deliveryMethod",
  });
  const subtotal = cartSubtotal(items);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await placeOrder({ ...values, items });
      if (!result.success) {
        form.setError("root", { message: result.error });
        return;
      }
      setProfile(values.profile);
      addHistoryEntry({
        orderId: result.data.orderId,
        placedAt: new Date().toISOString(),
        total: subtotal,
      });
      clearCart();
      router.push(`/payment/${result.data.orderId}`);
    });
  });

  if (items.length === 0) {
    return (
      <p className="text-ink-soft py-8 text-center text-sm">
        Your cart is empty.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field
        label="Name"
        error={form.formState.errors.profile?.fullName?.message}
      >
        {({ fieldId, describedBy }) => (
          <Input
            id={fieldId}
            autoComplete="name"
            aria-describedby={describedBy}
            {...form.register("profile.fullName")}
          />
        )}
      </Field>

      <Field
        label="Phone number"
        error={form.formState.errors.profile?.phone?.message}
      >
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
              {...form.register("profile.phone")}
            />
          </div>
        )}
      </Field>

      <div>
        <span className="text-ink mb-1.5 block text-sm font-medium">
          Delivery method
        </span>
        <div
          className="grid grid-cols-2 gap-2"
          role="radiogroup"
          aria-label="Delivery method"
        >
          {(
            [
              { value: "room_delivery", label: "Room Delivery" },
              { value: "pickup", label: "Pickup" },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-md border px-3 py-3 text-center text-sm font-medium",
                deliveryMethod === option.value
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-ink",
              )}
            >
              <input
                type="radio"
                value={option.value}
                className="sr-only"
                {...form.register("deliveryMethod")}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {deliveryMethod === "room_delivery" && (
        <Field
          label="Room number"
          error={form.formState.errors.profile?.roomNumber?.message}
        >
          {({ fieldId, describedBy }) => (
            <Input
              id={fieldId}
              aria-describedby={describedBy}
              {...form.register("profile.roomNumber")}
            />
          )}
        </Field>
      )}

      <Field label="Note (optional)">
        {({ fieldId }) => <Input id={fieldId} {...form.register("notes")} />}
      </Field>

      {form.formState.errors.root && (
        <p role="alert" className="text-danger text-sm">
          {form.formState.errors.root.message}
        </p>
      )}

      <div className="border-border flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-ink-soft">Subtotal</span>
        <span className="text-ink font-mono font-semibold tabular-nums">
          ₹{subtotal.toFixed(0)}
        </span>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Placing order…" : "Continue to payment"}
      </Button>
    </form>
  );
}
