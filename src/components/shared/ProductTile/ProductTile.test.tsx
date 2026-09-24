import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductTile } from "./ProductTile";

const product = {
  id: "APL-IP15PM",
  name: "iPhone 15 Pro Max",
  brand: "Apple",
  basePrice: 1319,
  imageUrl: "http://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
};

describe("ProductTile", () => {
  it("renders name, brand and image", () => {
    render(<ProductTile {...product} />);
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Apple iPhone 15 Pro Max");
  });

  it("normalizes http image urls to https", () => {
    render(<ProductTile {...product} />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toContain(
      "https://prueba-tecnica-api-tienda-moviles.onrender.com",
    );
  });

  it("renders the formatted base price", () => {
    render(<ProductTile {...product} />);
    const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(
      1319,
    );
    expect(screen.getByText(formatted)).toBeInTheDocument();
  });

  it("links to /phones/[id]", () => {
    render(<ProductTile {...product} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/phones/APL-IP15PM");
  });
});
