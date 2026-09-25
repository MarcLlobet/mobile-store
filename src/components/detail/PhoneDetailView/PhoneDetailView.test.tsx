import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { productDetail } from "@mocks/fixtures";
import { CartProvider, CART_STORAGE_KEY } from "@/context/CartContext";
import { PhoneDetailView } from "./PhoneDetailView";

/**
 * Driven by the *recorded* `/products/{id}` response (mocks/products_id.json)
 * rather than a hand-written product, so the view is proven against the data
 * the API actually returns — including the parts that are easy to get wrong
 * when inventing a fixture:
 *
 *  - there is no top-level `imageUrl`; every image comes from `colorOptions`
 *  - `storageOptions[].price` is absolute and the cheapest tier (256 GB,
 *    1229) is *below* `basePrice` (1329), so a "basePrice + delta" reading of
 *    the API would show the wrong number here
 *  - image URLs arrive over plain http:// and must be normalized
 */

const product = productDetail;
const [firstColor, secondColor] = product.colorOptions;
const [cheapestStorage] = product.storageOptions;

const httpsImage = (url: string) => url.replace(/^http:/, "https:");

/**
 * Puts cart lines for this product in localStorage before mounting, which is
 * the only way the Detail view's selection can be seeded — CartProvider reads
 * that key once, after mount.
 */
function seedCart(...lines: { color: string; storage: string }[]) {
  window.localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify(
      lines.map(({ color, storage }) => ({
        cartItemId: `${product.id}-${color}-${storage}`,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        imageUrl: "https://example.com/whatever.webp",
        color,
        storage,
        unitPrice: 0,
      })),
    ),
  );
}

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

const eur = (value: number) => `${Math.round(value)} EUR`;

describe("PhoneDetailView", () => {
  it("renders the name as the heading and brand in the specs table (not above the title)", () => {
    renderView();
    expect(screen.getByRole("heading", { level: 1, name: product.name })).toBeInTheDocument();
    // Brand is no longer shown above the title (confirmed real Figma layout
    // has no such label) — it's only in the Specifications table now.
    expect(screen.getByText(product.brand, { selector: "dd" })).toBeInTheDocument();
  });

  it("defaults the hero to the first color's image, normalized to https", () => {
    renderView();
    expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
      "src",
      httpsImage(firstColor.imageUrl),
    );
  });

  it("shows basePrice before a selection — not the cheapest storage tier's price", () => {
    renderView();
    // basePrice 1329 vs 256 GB 1229: the recorded data makes these differ, so
    // this catches reading the price off storageOptions[0] by mistake.
    expect(product.basePrice).not.toBe(cheapestStorage.price);
    expect(screen.getByText(eur(product.basePrice))).toBeInTheDocument();
    expect(screen.queryByText(eur(cheapestStorage.price))).not.toBeInTheDocument();
  });

  it("swaps the hero image when a different color is clicked", async () => {
    renderView();
    await userEvent.click(screen.getByRole("radio", { name: secondColor.name }));
    expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
      "src",
      httpsImage(secondColor.imageUrl),
    );
  });

  it("updates the displayed price to the selected tier's absolute price, even when it is lower", async () => {
    renderView();
    await userEvent.click(screen.getByRole("radio", { name: cheapestStorage.capacity }));
    expect(screen.getByText(eur(cheapestStorage.price))).toBeInTheDocument();
    expect(screen.queryByText(eur(product.basePrice))).not.toBeInTheDocument();
  });

  it("keeps Add to cart disabled until both color and storage are selected, then enables it", async () => {
    renderView();
    const addToCart = screen.getByRole("button", { name: "Añadir" });
    expect(addToCart).toBeDisabled();

    await userEvent.click(screen.getByRole("radio", { name: firstColor.name }));
    expect(addToCart).toBeDisabled();

    await userEvent.click(screen.getByRole("radio", { name: cheapestStorage.capacity }));
    expect(addToCart).toBeEnabled();

    await userEvent.click(addToCart);
    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      productId: product.id,
      color: firstColor.name,
      storage: cheapestStorage.capacity,
      unitPrice: cheapestStorage.price,
    });
  });

  it("renders the full specs list and the embedded similar products", () => {
    renderView();
    expect(screen.getByRole("heading", { name: "Specifications" })).toBeInTheDocument();
    expect(screen.getByText(product.specs.processor)).toBeInTheDocument();
    expect(screen.getByText(product.description)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Similar items" })).toBeInTheDocument();

    const [firstSimilar] = product.similarProducts;
    expect(screen.getByRole("link", { name: new RegExp(firstSimilar.name, "i") })).toHaveAttribute(
      "href",
      `/phones/${firstSimilar.id}`,
    );
  });

  it("pre-fetches every color's image so selecting one needs no new request", () => {
    const { container } = renderView();
    const srcs = Array.from(container.querySelectorAll("img"), (img) => img.getAttribute("src"));

    // All four recorded variants are in the DOM from the first render, https-
    // normalized, rather than being fetched when their swatch is clicked.
    for (const color of product.colorOptions) {
      expect(srcs).toContain(httpsImage(color.imageUrl));
    }
  });

  describe("CSS hover-preview contract", () => {
    // Previewing a color on hover is a `:has()` rule in
    // PhoneDetailView.module.css — no state, no handler, nothing jsdom can
    // evaluate. What these tests pin down is the positional pairing the rule
    // matches on, which is the part that would silently break it.
    it("pairs every swatch with the hero image at the same index", () => {
      const { container } = renderView();

      const swatchIndexes = screen
        .getAllByRole("radio")
        .filter((radio) => radio.hasAttribute("data-color-index"))
        .map((radio) => radio.getAttribute("data-color-index"));
      const variantIndexes = Array.from(
        container.querySelectorAll("[data-variant-index]"),
        (image) => image.getAttribute("data-variant-index"),
      );

      expect(swatchIndexes).toEqual(["0", "1", "2", "3"]);
      expect(variantIndexes).toEqual(swatchIndexes);
    });

    it("keeps each index pointing at that color's own image", () => {
      const { container } = renderView();

      product.colorOptions.forEach((color, index) => {
        const image = container.querySelector(`[data-variant-index="${index}"]`);
        expect(image).toHaveAttribute("src", httpsImage(color.imageUrl));
        expect(screen.getByRole("radio", { name: color.name })).toHaveAttribute(
          "data-color-index",
          String(index),
        );
      });
    });

    it("exposes no hover handlers — pointing at a swatch cannot change state", async () => {
      renderView();
      const yellow = product.colorOptions[3];

      await userEvent.hover(screen.getByRole("radio", { name: yellow.name }));

      // The selection, the named image and the price are all untouched: only
      // CSS knows about the pointer.
      expect(screen.getByRole("radio", { name: yellow.name })).toHaveAttribute(
        "aria-checked",
        "false",
      );
      expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
        "src",
        httpsImage(firstColor.imageUrl),
      );
      expect(screen.getByText(eur(product.basePrice))).toBeInTheDocument();
    });
  });

  describe("one derived selection", () => {
    it("shows the first color without selecting it", () => {
      renderView();

      // Displayed, so the page always has an image...
      expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
        "src",
        httpsImage(firstColor.imageUrl),
      );
      // ...but not selected: showing is not choosing.
      expect(
        screen.getAllByRole("radio").filter((r) => r.getAttribute("aria-checked") === "true"),
      ).toHaveLength(0);
    });

    it("starts with nothing picked at all, so Add-to-cart is gated on both", () => {
      renderView();

      for (const option of product.storageOptions) {
        expect(screen.getByRole("radio", { name: option.capacity })).toHaveAttribute(
          "aria-checked",
          "false",
        );
      }
      expect(screen.getByText(eur(product.basePrice))).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Añadir" })).toBeDisabled();
    });

    it("defaults to the color and storage already in the cart for this phone", async () => {
      const [, blue] = product.colorOptions;
      const lastStorage = product.storageOptions[product.storageOptions.length - 1];
      seedCart({ color: blue.name, storage: lastStorage.capacity });

      renderView();

      // One state, seeded from localStorage via CartContext — which reads it
      // after mount, hence the wait.
      await waitFor(() =>
        expect(screen.getByRole("radio", { name: blue.name })).toHaveAttribute(
          "aria-checked",
          "true",
        ),
      );
      expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
        "src",
        httpsImage(blue.imageUrl),
      );
      expect(screen.getByText(eur(lastStorage.price))).toBeInTheDocument();
      // Both were genuinely chosen before, so the gate is legitimately open.
      expect(screen.getByRole("button", { name: "Añadir" })).toBeEnabled();
    });

    it("uses the most recent cart line when the phone was added more than once", async () => {
      const [, blue] = product.colorOptions;
      const yellow = product.colorOptions[3];
      seedCart(
        { color: blue.name, storage: product.storageOptions[0].capacity },
        { color: yellow.name, storage: product.storageOptions[0].capacity },
      );

      renderView();

      await waitFor(() =>
        expect(screen.getByRole("radio", { name: yellow.name })).toHaveAttribute(
          "aria-checked",
          "true",
        ),
      );
    });

    it("ignores a cart line whose variant the API no longer offers", async () => {
      seedCart({ color: "Discontinued Pink", storage: "4 TB" });

      renderView();
      // Nothing visible changes in this case, so there is no state to wait
      // *for* — flush CartProvider's post-mount storage read instead.
      await act(async () => {});

      // Falls through rather than resurrecting a dead variant: nothing is
      // selected, and the hero shows the first color as a stand-in.
      expect(
        screen.getAllByRole("radio").filter((r) => r.getAttribute("aria-checked") === "true"),
      ).toHaveLength(0);
      expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
        "src",
        httpsImage(firstColor.imageUrl),
      );
      expect(screen.getByRole("button", { name: "Añadir" })).toBeDisabled();
    });

    it("lets a fresh pick override the cart's colour, keeping the cart's storage", async () => {
      const [, blue] = product.colorOptions;
      const lastStorage = product.storageOptions[product.storageOptions.length - 1];
      seedCart({ color: blue.name, storage: lastStorage.capacity });
      renderView();
      await waitFor(() =>
        expect(screen.getByRole("radio", { name: blue.name })).toHaveAttribute(
          "aria-checked",
          "true",
        ),
      );

      await userEvent.click(screen.getByRole("radio", { name: firstColor.name }));

      expect(screen.getByRole("radio", { name: firstColor.name })).toHaveAttribute(
        "aria-checked",
        "true",
      );
      // The untouched half of the single state survives the pick.
      expect(screen.getByText(eur(lastStorage.price))).toBeInTheDocument();
    });
  });

  it("still renders when the API returns a product with no color options", () => {
    render(
      <CartProvider>
        <PhoneDetailView product={{ ...product, colorOptions: [] }} />
      </CartProvider>,
    );
    // No top-level imageUrl exists to fall back to, so the hero is simply
    // omitted rather than rendering a broken <img src="">.
    expect(screen.getByRole("heading", { level: 1, name: product.name })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: product.name })).not.toBeInTheDocument();
  });
});
