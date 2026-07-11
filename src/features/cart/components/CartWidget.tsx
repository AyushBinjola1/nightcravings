"use client";

import { useState } from "react";

import { CartBar } from "@/features/cart/components/CartBar";
import { CartSheet } from "@/features/cart/components/CartSheet";

/** Mounts the persistent cart bar + its sheet together (Phase 2 §6). */
export function CartWidget({
  deliveryFee,
  freeDeliveryThreshold,
}: {
  deliveryFee: number;
  freeDeliveryThreshold: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CartBar onOpen={() => setOpen(true)} />
      <CartSheet
        open={open}
        onOpenChange={setOpen}
        deliveryFee={deliveryFee}
        freeDeliveryThreshold={freeDeliveryThreshold}
      />
    </>
  );
}
