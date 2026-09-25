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
  it("renders the name, the storage|colour line and the price", () => {
    render(
      <ul>
        <CartItem item={item} onRemove={vi.fn()} />
      </ul>,
    );
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    // CONFIRMED — the frames show "<storage> | <colour>", and no brand line.
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
    // Several rows can be on screen at once, so "Eliminar" alone would be
    // ambiguous in a screen reader's list of controls.
    expect(remove).toHaveTextContent("Eliminar");
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
