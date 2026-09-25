import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductTile } from "./ProductTile";

const product = {
  id: "APL-IP15PM",
  name: "iPhone 15 Pro Max",
  brand: "Apple",
  basePrice: 1319,
  imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
};

describe("ProductTile", () => {
  it("renders name, brand and image", () => {
    render(<ProductTile {...product} />);
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Apple iPhone 15 Pro Max");
  });

  it("renders the image url it is given", () => {
    render(<ProductTile {...product} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute(
      "src",
      expect.stringContaining("https://prueba-tecnica-api-tienda-moviles.onrender.com"),
    );
  });

  it("renders the formatted base price", () => {
    render(<ProductTile {...product} />);
    expect(screen.getByText("1319 EUR")).toBeInTheDocument();
  });

  it("links to /phones/[id]", () => {
    render(<ProductTile {...product} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/phones/APL-IP15PM");
  });
});
