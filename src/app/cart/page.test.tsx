import { useEffect } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CartProvider, useCart } from "@/context/CartContext";
import type { NewCartItem } from "@/types/cart";
import CartPage from "./page";

/**
 * Integration-style test using the real `CartProvider` (not a mock) so this
 * exercises the exact contract the page is built against: empty state,
 * rendering real items, remove-recalculates-total, and empty-after-last-
 * remove. `Seeded` adds items via a mount effect, which — per the documented
 * race guard in `CartContext` — always runs before the provider's own
 * localStorage-hydration effect, so these seeded items are never clobbered.
 */
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

function Seeded({ items }: { items: NewCartItem[] }) {
  const { addItem } = useCart();
  useEffect(() => {
    items.forEach(addItem);
  }, [items, addItem]);
  return <CartPage />;
}

function renderWithCart(items: NewCartItem[] = []) {
  return render(
    <CartProvider>
      <Seeded items={items} />
    </CartProvider>,
  );
}

function formatEUR(value: number): string {
  return `${Math.round(value)} EUR`;
}

describe("CartPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the empty state when the cart has no items", () => {
    renderWithCart([]);
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  it("renders a row per item and the total price", () => {
    renderWithCart(seedItems);
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("Samsung Galaxy S24 Ultra")).toBeInTheDocument();
    expect(screen.getByText(formatEUR(1319 + 1499))).toBeInTheDocument();
  });

  it("removes a row and recalculates the total when its remove button is clicked", async () => {
    renderWithCart(seedItems);
    await userEvent.click(
      screen.getByRole("button", { name: "Remove iPhone 15 Pro Max from cart" }),
    );
    expect(screen.queryByText("iPhone 15 Pro Max")).not.toBeInTheDocument();
    expect(screen.getByText("Samsung Galaxy S24 Ultra")).toBeInTheDocument();
    // Scope to the total row specifically: the remaining item's own unit
    // price happens to equal the new total here, so an unscoped text query
    // would be ambiguous (two matching nodes) — this asserts the *summary*
    // recalculated, not merely that some node somewhere shows the value.
    const totalRow = screen.getByText("Total").closest("div");
    expect(totalRow).not.toBeNull();
    expect(within(totalRow!).getByText(formatEUR(1499))).toBeInTheDocument();
  });

  it("shows the empty state after removing the last item", async () => {
    renderWithCart([seedItems[0]]);
    await userEvent.click(
      screen.getByRole("button", { name: "Remove iPhone 15 Pro Max from cart" }),
    );
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });
});
