import { describe, expect, it } from "vitest";

import { customerProfileSchema } from "@/lib/zod-schemas/customer-profile";
import { staffLoginSchema } from "@/lib/zod-schemas/auth";
import { placeOrderSchema } from "@/lib/zod-schemas/checkout";

describe("customerProfileSchema", () => {
  it("accepts a valid Indian mobile number", () => {
    const result = customerProfileSchema.safeParse({
      fullName: "Priya",
      phone: "9876543210",
      roomNumber: "C-214",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a phone number not starting 6-9", () => {
    const result = customerProfileSchema.safeParse({
      fullName: "Priya",
      phone: "5876543210",
      roomNumber: "C-214",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a phone number that isn't 10 digits", () => {
    const result = customerProfileSchema.safeParse({
      fullName: "Priya",
      phone: "98765",
      roomNumber: "C-214",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = customerProfileSchema.safeParse({
      fullName: "",
      phone: "9876543210",
      roomNumber: "C-214",
    });
    expect(result.success).toBe(false);
  });
});

describe("staffLoginSchema", () => {
  it("lowercases and trims the email", () => {
    const result = staffLoginSchema.safeParse({
      email: "  Owner@NightCravings.com  ",
      password: "supersecret",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("owner@nightcravings.com");
    }
  });

  it("rejects a password under 8 characters", () => {
    const result = staffLoginSchema.safeParse({
      email: "owner@nightcravings.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("placeOrderSchema", () => {
  const baseItems = [
    {
      productId: "11111111-1111-4111-8111-111111111111",
      name: "Maggi",
      price: 18,
      quantity: 1,
    },
  ];

  it("requires a room number for room_delivery", () => {
    const result = placeOrderSchema.safeParse({
      profile: { fullName: "Priya", phone: "9876543210", roomNumber: "" },
      deliveryMethod: "room_delivery",
      items: baseItems,
    });
    expect(result.success).toBe(false);
  });

  it("does not require a room number for pickup", () => {
    const result = placeOrderSchema.safeParse({
      profile: { fullName: "Priya", phone: "9876543210", roomNumber: "" },
      deliveryMethod: "pickup",
      items: baseItems,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty cart", () => {
    const result = placeOrderSchema.safeParse({
      profile: { fullName: "Priya", phone: "9876543210", roomNumber: "C-1" },
      deliveryMethod: "pickup",
      items: [],
    });
    expect(result.success).toBe(false);
  });
});
