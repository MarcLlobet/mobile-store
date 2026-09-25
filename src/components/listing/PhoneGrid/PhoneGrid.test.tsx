import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ProductListItem } from "@/lib/api/types";

import { PhoneGrid } from "./PhoneGrid";

const products: ProductListItem[] = [
  {
    id: "XMI-RN13P5G",
    brand: "Xiaomi",
    name: "Redmi Note 13 Pro 5G",
    basePrice: 299,
    imageUrl: "https://example.com/1.png",
  },
  {
    id: "XMI-RN13P5G",
    brand: "Xiaomi",
    name: "Redmi Note 13 Pro 5G",
    basePrice: 299,
    imageUrl: "https://example.com/1.png",
  },
  {
    id: "APL-IP15PM",
    brand: "Apple",
    name: "iPhone 15 Pro Max",
    basePrice: 1319,
    imageUrl: "https://example.com/2.png",
  },
];

describe("PhoneGrid", () => {
  it("renders a semantic list with one item per product", () => {
    render(<PhoneGrid products={products} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders each product's name, brand and link to its detail page", () => {
    render(<PhoneGrid products={products} />);
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/phones/XMI-RN13P5G");
    expect(links[2]).toHaveAttribute("href", "/phones/APL-IP15PM");
  });

  it("never logs a React duplicate-key warning, even with duplicate product ids", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());
    render(<PhoneGrid products={products} />);
    const hasDuplicateKeyWarning = errorSpy.mock.calls.some((call) =>
      call.some((arg) => typeof arg === "string" && arg.includes("same key")),
    );
    expect(hasDuplicateKeyWarning).toBe(false);
    errorSpy.mockRestore();
  });

  it("renders nothing but the empty list when given no products", () => {
    render(<PhoneGrid products={[]} />);
    expect(screen.getByRole("list")).toBeEmptyDOMElement();
  });
});
