import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BarChart } from "@/features/analytics/components/BarChart";

describe("BarChart", () => {
  it("renders an honest empty state instead of an empty chart", () => {
    render(<BarChart data={[]} />);
    expect(screen.getByText("No data yet.")).toBeInTheDocument();
  });

  it("renders one row per data point with the formatted value", () => {
    render(
      <BarChart
        data={[
          { label: "Mon", value: 100 },
          { label: "Tue", value: 250 },
        ]}
        formatValue={(v) => `₹${v}`}
      />,
    );
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("₹100")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("₹250")).toBeInTheDocument();
  });
});
