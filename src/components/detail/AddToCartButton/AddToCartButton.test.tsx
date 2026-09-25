import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { CartProvider, useCart } from "@/context/CartContext";
import { AddToCartButton } from "./AddToCartButton";

const color = { name: "Black", hexCode: "#000000", imageUrl: "http://example.com/black.png" };
const storage = { capacity: "256GB", price: 1319 };

function Harness({
  selectedColor = null as typeof color | null,
  selectedStorage = null as typeof storage | null,
}) {
  const { items } = useCart();
  return (
    <>
      <AddToCartButton
        productId="APL-IP15PM"
        name="iPhone 15 Pro Max"
        brand="Apple"
        selectedColor={selectedColor}
        selectedStorage={selectedStorage}
      />
      <p data-testid="cart-count">{items.length}</p>
      <p data-testid="cart-items">{JSON.stringify(items)}</p>
    </>
  );
}

function renderWithCart(props: Parameters<typeof Harness>[0]) {
  return render(
    <CartProvider>
      <Harness {...props} />
    </CartProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("AddToCartButton", () => {
  it("is disabled when neither color nor storage is selected", () => {
    renderWithCart({});
    expect(screen.getByRole("button", { name: "Añadir" })).toBeDisabled();
  });

  it("is disabled when only color is selected", () => {
    renderWithCart({ selectedColor: color });
    expect(screen.getByRole("button", { name: "Añadir" })).toBeDisabled();
  });

  it("is disabled when only storage is selected", () => {
    renderWithCart({ selectedStorage: storage });
    expect(screen.getByRole("button", { name: "Añadir" })).toBeDisabled();
  });

  it("is enabled once both color and storage are selected", () => {
    renderWithCart({ selectedColor: color, selectedStorage: storage });
    expect(screen.getByRole("button", { name: "Añadir" })).toBeEnabled();
  });

  it("calls addItem once with the exact expected payload, normalizing the image url", async () => {
    renderWithCart({ selectedColor: color, selectedStorage: storage });

    await userEvent.click(screen.getByRole("button", { name: "Añadir" }));

    expect(screen.getByTestId("cart-count")).toHaveTextContent("1");
    const items = JSON.parse(screen.getByTestId("cart-items").textContent ?? "[]");
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      productId: "APL-IP15PM",
      name: "iPhone 15 Pro Max",
      brand: "Apple",
      imageUrl: "https://example.com/black.png",
      color: "Black",
      storage: "256GB",
      unitPrice: 1319,
    });
  });
});
