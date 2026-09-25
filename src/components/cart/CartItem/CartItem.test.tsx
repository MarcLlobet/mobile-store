import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CartItem as CartItemModel } from "@/types/cart";

import { CartItem } from "./CartItem";

const item: CartItemModel = {
  cartItemId: "APL-IP15PM-Space Black-256GB",
  productId: "APL-IP15PM",
  name: "iPhone 15 Pro Max",
  brand: "Apple",
  imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
  color: "Space Black",
  storage: "256GB",
  unitPrice: 1319,
};

describe("CartItem", () => {
  it("renders the name, the storage|colour line and the price", () => {
    render(
      <ul>
        <CartItem item={item} onRemove={vi.fn()} />
      </ul>,
    );
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("256GB | Space Black")).toBeInTheDocument();
    expect(screen.queryByText("Apple")).not.toBeInTheDocument();
    expect(screen.getByText("1319 EUR")).toBeInTheDocument();
  });

  it("labels the remove control 'Eliminar' while keeping a distinguishing accessible name", () => {
    render(
      <ul>
        <CartItem item={item} onRemove={vi.fn()} />
      </ul>,
    );
    const remove = screen.getByRole("button", { name: "Remove iPhone 15 Pro Max from cart" });
    expect(remove).toHaveTextContent("Eliminar");
  });

  it("renders the image url it is given", () => {
    render(
      <ul>
        <CartItem item={item} onRemove={vi.fn()} />
      </ul>,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute(
      "src",
      expect.stringContaining("https://prueba-tecnica-api-tienda-moviles.onrender.com"),
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
