import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpecsList } from "./SpecsList";

const specs = {
  screen: "6.7 inch OLED",
  resolution: "2796 x 1290",
  processor: "A17 Pro",
  mainCamera: "48MP",
  selfieCamera: "12MP",
  battery: "4441 mAh",
  os: "iOS 17",
  screenRefreshRate: "120Hz",
};

describe("SpecsList", () => {
  it("renders all 8 spec fields plus the base price", () => {
    render(<SpecsList specs={specs} basePrice={1319} />);

    expect(screen.getByText("Base price")).toBeInTheDocument();
    expect(
      screen.getByText(
        new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(1319),
      ),
    ).toBeInTheDocument();

    for (const value of Object.values(specs)) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
  });

  it("renders a heading that labels the section", () => {
    render(<SpecsList specs={specs} basePrice={1319} />);
    expect(screen.getByRole("region", { name: "Technical specifications" })).toBeInTheDocument();
  });
});
