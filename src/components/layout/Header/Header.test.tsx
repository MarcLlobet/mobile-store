import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CartProvider, useCart } from "@/context/CartContext";
import { Header } from "./Header";

// Adds a line to the cart on a user click (not on mount) so this exercises
// the same real-world sequencing as a genuine "Add to cart" click: it can
// only ever happen after CartProvider's post-mount localStorage hydration
// has already settled, never racing it.
function HeaderWithAddButton() {
  const { addItem } = useCart();
  return (
    <>
      <button
        type="button"
        onClick={() =>
          addItem({
            productId: "P1",
            name: "Phone 1",
            brand: "Brand",
            imageUrl: "https://example.com/x.png",
            color: "Black",
            storage: "128GB",
            unitPrice: 100,
          })
        }
      >
        Add
      </button>
      <Header />
    </>
  );
}

describe("Header", () => {
  it("renders a home link and a cart link", () => {
    render(<Header />, { wrapper: CartProvider });
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /cart/i })).toHaveAttribute("href", "/cart");
  });

  it("always shows the item count, including 0 when the cart is empty", () => {
    render(<Header />, { wrapper: CartProvider });
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("updates the visible count once the cart has items", async () => {
    render(<HeaderWithAddButton />, { wrapper: CartProvider });
    await userEvent.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("takes no props", () => {
    expect(Header.length).toBe(0);
  });
});
