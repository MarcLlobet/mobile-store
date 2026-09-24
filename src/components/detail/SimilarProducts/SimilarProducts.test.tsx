import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SimilarProducts } from "./SimilarProducts";

const products = [
  {
    id: "XMI-RN13P5G",
    name: "Redmi Note 13 Pro 5G",
    brand: "Xiaomi",
    basePrice: 399,
    imageUrl: "http://example.com/a.png",
  },
  {
    id: "XMI-RN13P5G",
    name: "Redmi Note 13 Pro 5G (dup id)",
    brand: "Xiaomi",
    basePrice: 399,
    imageUrl: "http://example.com/b.png",
  },
];

describe("SimilarProducts", () => {
  it("renders one ProductTile link per product, keyed safely despite duplicate ids", () => {
    render(<SimilarProducts products={products} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/phones/XMI-RN13P5G");
    expect(links[1]).toHaveAttribute("href", "/phones/XMI-RN13P5G");
  });

  it("renders a labelled section heading", () => {
    render(<SimilarProducts products={products} />);
    expect(screen.getByRole("heading", { name: "Similar items" })).toBeInTheDocument();
  });

  it("renders nothing when there are no similar products", () => {
    const { container } = render(<SimilarProducts products={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
