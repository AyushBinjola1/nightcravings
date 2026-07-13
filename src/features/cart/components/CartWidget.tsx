"use client";

import { useState } from "react";

import { CartBar } from "@/features/cart/components/CartBar";
import { CartSheet } from "@/features/cart/components/CartSheet";
import type { Product } from "@/server/queries/catalogue";

export function CartWidget({
  deliveryFee,
  freeDeliveryThreshold,
  products,
}: {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  products: Product[];
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
        products={products}
      />
    </>
  );
}
