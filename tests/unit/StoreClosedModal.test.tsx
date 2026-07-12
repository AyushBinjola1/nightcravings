import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { StoreClosedModal } from "@/features/catalogue/components/StoreClosedModal";
import type { Hostel } from "@/server/queries/catalogue";

function makeHostel(status: Hostel["status"]): Hostel {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Demo Hostel",
    slug: "demo-hostel",
    status,
    opening_time: "18:00:00",
    closing_time: "02:00:00",
    delivery_fee: 25,
    free_delivery_threshold: 250,
    upi_qr_url: null,
    support_phone: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

describe("StoreClosedModal", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("shows the closed message and opening time for a closed store", () => {
    render(<StoreClosedModal hostel={makeHostel("closed")} />);
    expect(screen.getByText("WE ARE CLOSED")).toBeInTheDocument();
    expect(screen.getByText(/we'll open again at 18:00/i)).toBeInTheDocument();
  });

  it("shows a distinct message for maintenance", () => {
    render(<StoreClosedModal hostel={makeHostel("maintenance")} />);
    expect(screen.getByText("TEMPORARILY UNAVAILABLE")).toBeInTheDocument();
  });

  it("dismisses on 'Browse menu anyway' and remembers it for the session", async () => {
    render(<StoreClosedModal hostel={makeHostel("closed")} />);
    fireEvent.click(
      screen.getByRole("button", { name: /browse menu anyway/i }),
    );
    // The dismiss handler writes sessionStorage synchronously; the modal
    // itself only leaves the DOM once framer-motion's exit animation
    // finishes, which is asynchronous — wait for that instead of
    // asserting it's already gone.
    expect(
      sessionStorage.getItem("nightcravings-closed-notice-dismissed"),
    ).toBe("closed");
    await waitForElementToBeRemoved(() => screen.queryByText("WE ARE CLOSED"));
  });

  it("does not reopen on remount within the same session once dismissed", () => {
    sessionStorage.setItem("nightcravings-closed-notice-dismissed", "closed");
    render(<StoreClosedModal hostel={makeHostel("closed")} />);
    expect(screen.queryByText("WE ARE CLOSED")).not.toBeInTheDocument();
  });
});
