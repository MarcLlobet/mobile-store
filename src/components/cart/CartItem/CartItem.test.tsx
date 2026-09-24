import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CartItem } from "./CartItem";
import type { CartItem as CartItemModel } from "@/types/cart";

const item: CartItemModel = {
  cartItemId: "APL-IP15PM-Space Black-256GB",
  productId: "APL-IP15PM",
  name: "iPhone 15 Pro Max",
  brand: "Apple",
  imageUrl: "http://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
  color: "Space Black",
  storage: "256GB",
  unitPrice: 1319,
};

describe("CartItem", () => {
  it("renders name, brand, specs and price", () => {
    render(
      <ul>
        <CartItem item={item} onRemove={vi.fn()} />
      </ul>,
    );
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Color: Space Black · Storage: 256GB")).toBeInTheDocument();
    const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(
      1319,
    );
    expect(screen.getByText(formatted)).toBeInTheDocument();
  });

  it("normalizes http image urls to https", () => {
    render(
      <ul>
        <CartItem item={item} onRemove={vi.fn()} />
      </ul>,
    );
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toContain(
      "https://prueba-tecnica-api-tienda-moviles.onrender.com",
    );
    expect(img).toHaveAttribute("alt", "iPhone 15 Pro Max");
  });

  it("has an accessible, distinguishing remove button label", () => {
    render(
      <ul>
        <CartItem item={item} onRemove={vi.fn()} />
      </ul>,
    );
    expect(
      screen.getByRole("button", { name: "Remove iPhone 15 Pro Max from cart" }),
    ).toBeInTheDocument();
  });

  it("calls onRemove with this item's cartItemId when clicked", async () => {
    const onRemove = vi.fn();
    render(
      <ul>
        <CartItem item={item} onRemove={onRemove} />
      </ul>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Remove iPhone 15 Pro Max from cart" }),
    );
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith("APL-IP15PM-Space Black-256GB");
  });
});
