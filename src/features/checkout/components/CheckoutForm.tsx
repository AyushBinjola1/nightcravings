"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ChevronRight,
  MapPin,
  Truck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

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

export function CheckoutForm({
  isStoreOpen,
  deliveryFee,
  freeDeliveryThreshold,
}: {
  isStoreOpen: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
}) {
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
  const total =
    deliveryMethod === "room_delivery" && subtotal < freeDeliveryThreshold
      ? subtotal + deliveryFee
      : subtotal;

  useEffect(() => {
    form.setValue("items", items);
  }, [items, form]);

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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-surface-2 text-ink-soft mb-4 rounded-full p-4">
          <ShoppingBag size={32} />
        </div>
        <p className="text-ink-soft mb-4 text-sm font-semibold">
          Your cart is empty.
        </p>
        <Button onClick={() => router.push("/")} className="rounded-full px-6">
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="flex flex-col gap-6"
    >
      {/* Mini Order Summary Card */}
      <div className="border-border/60 bg-surface/30 shadow-premium rounded-2xl border p-4.5">
        <h3 className="text-ink text-ink-soft mb-3 text-xs font-bold tracking-wider uppercase">
          Order Summary
        </h3>
        <div className="flex max-h-24 flex-col gap-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-ink font-medium">
                {item.quantity}x {item.name}
              </span>
              <span className="text-ink-soft font-mono">
                ₹{(item.price * item.quantity).toFixed(0)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-border/40 mt-3 flex items-center justify-between border-t pt-3 text-sm font-bold">
          <span className="text-ink">Items Subtotal</span>
          <span className="text-ink font-mono">₹{subtotal.toFixed(0)}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        {/* Contact Info Group */}
        <div className="bg-surface/10 border-border/40 flex flex-col gap-4 rounded-2xl border p-4.5 shadow-sm">
          <h3 className="text-ink-soft border-border/40 mb-2 border-b pb-2 text-xs font-bold tracking-wider uppercase">
            Contact Information
          </h3>

          <Field
            label="Your Name"
            error={form.formState.errors.profile?.fullName?.message}
          >
            {({ fieldId, describedBy }) => (
              <Input
                id={fieldId}
                autoComplete="name"
                aria-describedby={describedBy}
                placeholder="Enter your full name"
                className="bg-paper/60 focus:bg-paper focus:border-night focus:ring-night/10 rounded-full shadow-sm focus:ring-2"
                {...form.register("profile.fullName")}
              />
            )}
          </Field>

          <Field
            label="Phone number"
            error={form.formState.errors.profile?.phone?.message}
          >
            {({ fieldId, describedBy }) => (
              <div
                className={cn(
                  "bg-paper/60 focus-within:bg-paper focus-within:border-night focus-within:ring-night/10 flex items-center gap-2 rounded-full border px-4 shadow-sm transition-all duration-200 focus-within:ring-2",
                  form.formState.errors.profile?.phone
                    ? "border-danger focus-within:border-danger focus-within:ring-danger/10"
                    : "border-border/80",
                )}
              >
                <span className="text-ink-soft border-border/60 border-r pr-2.5 font-mono text-sm">
                  +91
                </span>
                <input
                  id={fieldId}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                  aria-describedby={describedBy}
                  className="text-ink w-full bg-transparent py-2.5 text-sm font-medium outline-none"
                  {...form.register("profile.phone")}
                />
              </div>
            )}
          </Field>
        </div>

        {/* Delivery Method Selector */}
        <div className="bg-surface/10 border-border/40 flex flex-col gap-3 rounded-2xl border p-4.5 shadow-sm">
          <h3 className="text-ink-soft border-border/40 border-b pb-2 text-xs font-bold tracking-wider uppercase">
            Delivery Option
          </h3>
          <div
            className="grid grid-cols-2 gap-3 pt-2"
            role="radiogroup"
            aria-label="Delivery method"
          >
            {(
              [
                {
                  value: "room_delivery",
                  label: "Room Delivery",
                  icon: Truck,
                  hint:
                    subtotal >= freeDeliveryThreshold
                      ? "Free Delivery"
                      : `₹${deliveryFee.toFixed(0)} fee`,
                },
                {
                  value: "pickup",
                  label: "Self Pickup",
                  icon: MapPin,
                  hint: "Free",
                },
              ] as const
            ).map((option) => {
              const isSelected = deliveryMethod === option.value;
              const Icon = option.icon;
              return (
                <motion.label
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex cursor-pointer flex-col items-center gap-2 overflow-hidden rounded-2xl border-2 p-4 text-center shadow-sm transition-all duration-300",
                    isSelected
                      ? "border-night bg-night/5 text-night shadow-glow-purple font-bold"
                      : "border-border/80 bg-paper/60 text-ink hover:bg-surface-2/40",
                  )}
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="sr-only"
                    {...form.register("deliveryMethod")}
                  />
                  <div
                    className={cn(
                      "rounded-full p-2 transition-colors",
                      isSelected
                        ? "bg-night text-paper"
                        : "bg-surface-2 text-ink-soft",
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <span className="block text-sm">{option.label}</span>
                    <span className="text-ink-soft mt-1 block text-[10px] font-bold tracking-wider uppercase">
                      {option.hint}
                    </span>
                  </div>
                </motion.label>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {deliveryMethod === "room_delivery" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="overflow-hidden pt-2"
              >
                <Field
                  label="Room number"
                  error={form.formState.errors.profile?.roomNumber?.message}
                >
                  {({ fieldId, describedBy }) => (
                    <Input
                      id={fieldId}
                      aria-describedby={describedBy}
                      placeholder="e.g. C-302, Hostel 4"
                      className="bg-paper/60 focus:bg-paper focus:border-night focus:ring-night/10 rounded-full shadow-sm focus:ring-2"
                      {...form.register("profile.roomNumber")}
                    />
                  )}
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Note Option */}
        <div className="bg-surface/10 border-border/40 flex flex-col gap-3 rounded-2xl border p-4.5 shadow-sm">
          <Field label="Order notes (optional)">
            {({ fieldId }) => (
              <Input
                id={fieldId}
                placeholder="e.g. Call before coming, drop at gate..."
                className="bg-paper/60 focus:bg-paper focus:border-night focus:ring-night/10 rounded-full shadow-sm focus:ring-2"
                {...form.register("notes")}
              />
            )}
          </Field>
        </div>

        {/* Validation Errors & Reset */}
        <AnimatePresence>
          {form.formState.errors.root && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-danger-soft/40 border-danger/20 flex flex-col gap-3 rounded-2xl border p-4 text-sm"
            >
              <div className="text-danger flex items-center gap-2 font-semibold">
                <AlertCircle size={16} />
                <span>{form.formState.errors.root.message}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-ink border-border bg-paper hover:bg-surface-2 self-start rounded-full border px-4 text-xs font-bold"
                onClick={() => {
                  clearCart();
                  form.clearErrors("root");
                }}
              >
                <RefreshCw size={12} className="mr-1.5" /> Clear cart & restart
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final Price Breakdown & Checkout Button */}
        <div className="border-border/40 flex flex-col gap-4 border-t pt-4">
          <div className="flex flex-col gap-1.5 text-xs font-medium">
            <div className="text-ink-soft flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-mono">₹{subtotal.toFixed(0)}</span>
            </div>
            {deliveryMethod === "room_delivery" && (
              <div className="text-ink-soft flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-mono">
                  {subtotal >= freeDeliveryThreshold
                    ? "Free"
                    : `₹${deliveryFee.toFixed(0)}`}
                </span>
              </div>
            )}
            <div className="border-border/20 text-ink mt-1 flex justify-between border-t pt-2.5 text-sm font-bold">
              <span>Order Total</span>
              <span className="text-night font-mono text-base">
                ₹{total.toFixed(0)}
              </span>
            </div>
          </div>

          {!isStoreOpen && (
            <div className="bg-danger-soft border-danger/10 text-danger flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-sm">
              <AlertCircle size={14} />
              <span>
                Store is currently closed — orders can&apos;t be placed right
                now.
              </span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending || !isStoreOpen}
            className="shadow-accent/25 w-full cursor-pointer rounded-full py-4 text-sm font-bold shadow-lg transition-transform active:scale-98"
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <span className="border-paper h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                <span>Processing Order...</span>
              </div>
            ) : !isStoreOpen ? (
              "Store is Closed"
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Continue to Payment <ChevronRight size={16} />
              </span>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
