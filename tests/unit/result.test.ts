import { describe, expect, it } from "vitest";

import { actionError, actionOk } from "@/lib/result";

describe("ActionResult", () => {
  it("actionOk produces a discriminated success result", () => {
    const result = actionOk({ orderId: "abc" });
    expect(result.success).toBe(true);
    if (result.success) {
      // Narrowing on `success`, not truthiness of `error` — this is the
      // exact bug fixed in Stage 2 (an empty-string error would otherwise
      // be indistinguishable from success under a truthiness check).
      expect(result.data.orderId).toBe("abc");
    }
  });

  it("actionError produces a discriminated failure result", () => {
    const result = actionError<{ orderId: string }>("went wrong");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("went wrong");
    }
  });

  it("an empty-string error is still correctly the failure branch", () => {
    const result = actionError<{ orderId: string }>("");
    expect(result.success).toBe(false);
  });
});
