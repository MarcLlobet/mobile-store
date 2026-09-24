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

const description = "The latest iPhone.";

describe("SpecsList", () => {
  it("renders brand, name and all 8 spec fields", () => {
    render(
      <SpecsList brand="Apple" name="iPhone 15 Pro" specs={specs} description={description} />,
    );

    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15 Pro")).toBeInTheDocument();

    for (const value of Object.values(specs)) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
  });

  it("does not render a base-price row — price is shown elsewhere, not in this table", () => {
    render(
      <SpecsList brand="Apple" name="iPhone 15 Pro" specs={specs} description={description} />,
    );
    expect(screen.queryByText("Base price")).not.toBeInTheDocument();
  });

  it("renders a description row from the product description", () => {
    render(
      <SpecsList brand="Apple" name="iPhone 15 Pro" specs={specs} description={description} />,
    );
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it("renders a heading that labels the section", () => {
    render(
      <SpecsList brand="Apple" name="iPhone 15 Pro" specs={specs} description={description} />,
    );
    expect(screen.getByRole("region", { name: "Specifications" })).toBeInTheDocument();
  });
});
