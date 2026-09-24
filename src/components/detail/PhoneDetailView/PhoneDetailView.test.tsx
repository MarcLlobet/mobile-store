import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { CartProvider, CART_STORAGE_KEY } from "@/context/CartContext";
import type { ProductDetail } from "@/lib/api/types";
import { PhoneDetailView } from "./PhoneDetailView";

const product: ProductDetail = {
  id: "APL-IP15PM",
  name: "iPhone 15 Pro Max",
  brand: "Apple",
  basePrice: 1319,
  imageUrl: "http://example.com/default.png",
  description: "The latest iPhone.",
  rating: 4.8,
  specs: {
    screen: "6.7 inch OLED",
    resolution: "2796 x 1290",
    processor: "A17 Pro",
    mainCamera: "48MP",
    selfieCamera: "12MP",
    battery: "4441 mAh",
    os: "iOS 17",
    screenRefreshRate: "120Hz",
  },
  colorOptions: [
    { name: "Black Titanium", hexCode: "#3b3b3b", imageUrl: "http://example.com/black.png" },
    { name: "Blue Titanium", hexCode: "#3b5f8a", imageUrl: "http://example.com/blue.png" },
  ],
  storageOptions: [
    { capacity: "256GB", price: 1319 },
    { capacity: "512GB", price: 1449 },
    { capacity: "1TB", price: 1699 },
  ],
  similarProducts: [
    {
      id: "APL-IP15P",
      name: "iPhone 15 Pro",
      brand: "Apple",
      basePrice: 1219,
      imageUrl: "http://example.com/ip15p.png",
    },
  ],
};

function renderView() {
  return render(
    <CartProvider>
      <PhoneDetailView product={product} />
    </CartProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

const eur = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(value);

describe("PhoneDetailView", () => {
  it("renders name and brand", () => {
    renderView();
    expect(
      screen.getByRole("heading", { level: 1, name: "iPhone 15 Pro Max" }),
    ).toBeInTheDocument();
    // "Apple" also appears on the similar-products ProductTile, so scope to
    // the brand element specifically rather than asserting a single match.
    expect(screen.getByText("Apple", { selector: "p" })).toBeInTheDocument();
  });

  it("defaults the hero image to the first color and the price to basePrice before any selection", () => {
    renderView();
    expect(screen.getByRole("img", { name: "iPhone 15 Pro Max" })).toHaveAttribute(
      "src",
      "https://example.com/black.png",
    );
    // 1319 shows both as the headline price and as SpecsList's "Base price".
    expect(screen.getAllByText(eur(1319)).length).toBeGreaterThan(0);
  });

  it("swaps the hero image when a different color is clicked", async () => {
    renderView();
    await userEvent.click(screen.getByRole("radio", { name: "Blue Titanium" }));
    expect(screen.getByRole("img", { name: "iPhone 15 Pro Max" })).toHaveAttribute(
      "src",
      "https://example.com/blue.png",
    );
  });

  it("updates the displayed price to the selected storage tier's absolute price", async () => {
    renderView();
    await userEvent.click(screen.getByRole("radio", { name: /512GB/ }));
    expect(screen.getAllByText(eur(1449)).length).toBeGreaterThan(0);
  });

  it("keeps Add to cart disabled until both color and storage are selected, then enables it", async () => {
    renderView();
    const addToCart = screen.getByRole("button", { name: "Add to cart" });
    expect(addToCart).toBeDisabled();

    await userEvent.click(screen.getByRole("radio", { name: "Black Titanium" }));
    expect(addToCart).toBeDisabled();

    await userEvent.click(screen.getByRole("radio", { name: /256GB/ }));
    expect(addToCart).toBeEnabled();

    await userEvent.click(addToCart);
    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      productId: "APL-IP15PM",
      color: "Black Titanium",
      storage: "256GB",
      unitPrice: 1319,
    });
  });

  it("renders the full specs list and the similar products section", () => {
    renderView();
    expect(screen.getByRole("heading", { name: "Technical specifications" })).toBeInTheDocument();
    expect(screen.getByText("A17 Pro")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Similar products" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /iPhone 15 Pro/ })).toHaveAttribute(
      "href",
      "/phones/APL-IP15P",
    );
  });

  it("renders a back-to-listing link", () => {
    renderView();
    expect(screen.getByRole("link", { name: "Back to listing" })).toHaveAttribute("href", "/");
  });
});
