import { useEffect } from "react";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CartProvider, useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { NewCartItem } from "@/types/cart";

import CartPage from "./page";

const seedItems: NewCartItem[] = [
  {
    productId: "APL-IP15PM",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
    color: "Space Black",
    storage: "256GB",
    unitPrice: 1319,
  },
  {
    productId: "SAM-GS24U",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/sam-gs24u.png",
    color: "Titanium Grey",
    storage: "512GB",
    unitPrice: 1499,
  },
];

const Seeded = ({ items }: { items: NewCartItem[] }) => {
  const { addItem } = useCart();
  useEffect(() => {
    items.forEach((item) => {
      addItem(item);
    });
  }, [items, addItem]);
  return <CartPage />;
};

const renderWithCart = (items: NewCartItem[] = []) =>
  render(
    <CartProvider>
      <Seeded items={items} />
    </CartProvider>,
  );

describe("CartPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the zero state as the same screen, with no rows and no empty card", () => {
    renderWithCart([]);
    expect(screen.getByRole("heading", { level: 1, name: "Cart (0)" })).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue shopping" })).toBeInTheDocument();
    const totalRow = screen.getByText("Total").closest("div");
    expect(within(totalRow!).getByText(formatPrice(0))).toBeInTheDocument();
  });

  it("renders a row per item and the total price", () => {
    renderWithCart(seedItems);
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("Samsung Galaxy S24 Ultra")).toBeInTheDocument();
    expect(screen.getByText(formatPrice(1319 + 1499))).toBeInTheDocument();
  });

  it("removes a row and recalculates the total when its remove button is clicked", async () => {
    renderWithCart(seedItems);
    await userEvent.click(
      screen.getByRole("button", { name: "Remove iPhone 15 Pro Max from cart" }),
    );
    expect(screen.queryByText("iPhone 15 Pro Max")).not.toBeInTheDocument();
    expect(screen.getByText("Samsung Galaxy S24 Ultra")).toBeInTheDocument();
    const totalRow = screen.getByText("Total").closest("div");
    expect(totalRow).not.toBeNull();
    expect(within(totalRow!).getByText(formatPrice(1499))).toBeInTheDocument();
  });

  it("removes only the clicked row when the same variant is in the cart several times", async () => {
    const warn = vi.spyOn(console, "error").mockImplementation(vi.fn());
    const fiveOfOne = Array.from({ length: 5 }, () => seedItems[0]!);
    renderWithCart(fiveOfOne);

    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    const totalRow = () => screen.getByText("Total").closest("div")!;
    expect(within(totalRow()).getByText(formatPrice(1319 * 5))).toBeInTheDocument();

    await userEvent.click(
      screen.getAllByRole("button", { name: "Remove iPhone 15 Pro Max from cart" })[0]!,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByRole("heading", { level: 1, name: "Cart (4)" })).toBeInTheDocument();
    expect(within(totalRow()).getByText(formatPrice(1319 * 4))).toBeInTheDocument();

    expect(warn.mock.calls.flat().join(" ")).not.toMatch(/same key|duplicate key/i);
    warn.mockRestore();
  });

  it("falls back to the zero state after removing the last item", async () => {
    renderWithCart([seedItems[0]!]);
    await userEvent.click(
      screen.getByRole("button", { name: "Remove iPhone 15 Pro Max from cart" }),
    );
    expect(screen.getByRole("heading", { level: 1, name: "Cart (0)" })).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
