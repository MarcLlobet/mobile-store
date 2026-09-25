import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CartItem as CartItemModel } from "@/types/cart";

import { CartList } from "./CartList";

const items: CartItemModel[] = [
  {
    cartItemId: "APL-IP15PM-Space Black-256GB",
    productId: "APL-IP15PM",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/apl-ip15pm.png",
    color: "Space Black",
    storage: "256GB",
    unitPrice: 1319,
  },
  {
    cartItemId: "SAM-GS24U-Titanium Grey-512GB",
    productId: "SAM-GS24U",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    imageUrl: "https://prueba-tecnica-api-tienda-moviles.onrender.com/images/sam-gs24u.png",
    color: "Titanium Grey",
    storage: "512GB",
    unitPrice: 1499,
  },
];

describe("CartList", () => {
  it("renders one row per item, no duplicate-key warning", () => {
    render(<CartList items={items} onRemove={vi.fn()} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("Samsung Galaxy S24 Ultra")).toBeInTheDocument();
  });

  it("renders an empty list when given no items", () => {
    render(<CartList items={[]} onRemove={vi.fn()} />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("calls onRemove with the clicked row's cartItemId", async () => {
    const onRemove = vi.fn();
    render(<CartList items={items} onRemove={onRemove} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Remove Samsung Galaxy S24 Ultra from cart" }),
    );
    expect(onRemove).toHaveBeenCalledWith("SAM-GS24U-Titanium Grey-512GB");
  });
});
