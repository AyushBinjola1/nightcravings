import { describe, expect, it } from "vitest";

import { cartItemCount, cartSubtotal, type CartItem } from "@/stores/cart";

const items: CartItem[] = [
  { productId: "1", name: "Maggi", price: 18, quantity: 2 },
  { productId: "2", name: "Sting", price: 40, quantity: 1 },
];

describe("cartSubtotal", () => {
  it("sums price * quantity across all items", () => {
    expect(cartSubtotal(items)).toBe(18 * 2 + 40);
  });

  it("returns 0 for an empty cart", () => {
    expect(cartSubtotal([])).toBe(0);
  });
});

describe("cartItemCount", () => {
  it("sums quantities, not line-item count", () => {
    expect(cartItemCount(items)).toBe(3);
  });

  it("returns 0 for an empty cart", () => {
    expect(cartItemCount([])).toBe(0);
  });
});
