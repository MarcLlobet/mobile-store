import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";

import { CartProvider, CART_STORAGE_KEY } from "@/context/CartContext";
import { createTranslator } from "@/i18n";
import { normalizeProductDetail } from "@/lib/api/transform";
import { formatPrice } from "@/lib/utils/formatPrice";
import { productDetail } from "@mocks/fixtures";

import { PhoneDetailView } from "./PhoneDetailView";

const { t } = createTranslator();

const product = normalizeProductDetail(productDetail);
const firstColor = product.colorOptions[0]!;
const secondColor = product.colorOptions[1]!;
const cheapestStorage = product.storageOptions[0]!;

const seedCart = (...lines: { color: string; storage: string }[]) => {
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
};

const renderView = () =>
  render(
    <CartProvider>
      <PhoneDetailView product={product} />
    </CartProvider>,
  );

beforeEach(() => {
  window.localStorage.clear();
});

describe("PhoneDetailView", () => {
  it("renders the name as the heading and brand in the specs table (not above the title)", () => {
    renderView();
    expect(screen.getByRole("heading", { level: 1, name: product.name })).toBeInTheDocument();
    expect(screen.getByText(product.brand, { selector: "dd" })).toBeInTheDocument();
  });

  it("defaults the hero to the first color's image, normalized to https", () => {
    renderView();
    expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
      "src",
      firstColor.imageUrl,
    );
  });

  it("shows basePrice before a selection — not the cheapest storage tier's price", () => {
    renderView();
    expect(product.basePrice).not.toBe(cheapestStorage.price);
    expect(screen.getByText(formatPrice(product.basePrice))).toBeInTheDocument();
    expect(screen.queryByText(formatPrice(cheapestStorage.price))).not.toBeInTheDocument();
  });

  it("swaps the hero image when a different color is clicked", async () => {
    renderView();
    await userEvent.click(screen.getByRole("radio", { name: secondColor.name }));
    expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
      "src",
      secondColor.imageUrl,
    );
  });

  it("updates the displayed price to the selected tier's absolute price, even when it is lower", async () => {
    renderView();
    await userEvent.click(screen.getByRole("radio", { name: cheapestStorage.capacity }));
    expect(screen.getByText(formatPrice(cheapestStorage.price))).toBeInTheDocument();
    expect(screen.queryByText(formatPrice(product.basePrice))).not.toBeInTheDocument();
  });

  it("keeps Add to cart disabled until both color and storage are selected, then enables it", async () => {
    renderView();
    const addToCart = screen.getByRole("button", { name: t("detail.add_to_cart") });
    expect(addToCart).toBeDisabled();

    await userEvent.click(screen.getByRole("radio", { name: firstColor.name }));
    expect(addToCart).toBeDisabled();

    await userEvent.click(screen.getByRole("radio", { name: cheapestStorage.capacity }));
    expect(addToCart).toBeEnabled();

    await userEvent.click(addToCart);
    const stored: unknown = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(1);
    expect((stored as readonly unknown[])[0]).toMatchObject({
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

    const firstSimilar = product.similarProducts[0]!;
    expect(screen.getByRole("link", { name: new RegExp(firstSimilar.name, "i") })).toHaveAttribute(
      "href",
      `/phones/${firstSimilar.id}`,
    );
  });

  it("pre-fetches every color's image so selecting one needs no new request", () => {
    const { container } = renderView();
    const srcs = Array.from(container.querySelectorAll("img"), (img) => img.getAttribute("src"));

    product.colorOptions.forEach((color) => {
      expect(srcs).toContain(color.imageUrl);
    });
  });

  describe("CSS hover-preview contract", () => {
    it("pairs every swatch with the hero image at the same index", () => {
      const { container } = renderView();

      const swatchIndexes = screen
        .getAllByRole("radio")
        .filter((radio) => Object.hasOwn(radio.dataset, "colorIndex"))
        .map((radio) => radio.dataset.colorIndex);
      const variantIndexes = Array.from(
        container.querySelectorAll<HTMLElement>("[data-variant-index]"),
        (image) => image.dataset.variantIndex,
      );

      expect(swatchIndexes).toEqual(["0", "1", "2", "3"]);
      expect(variantIndexes).toEqual(swatchIndexes);
    });

    it("keeps each index pointing at that color's own image", () => {
      const { container } = renderView();

      product.colorOptions.forEach((color, index) => {
        const image = container.querySelector(
          `[data-variant-index="${CSS.escape(String(index))}"]`,
        );
        expect(image).toHaveAttribute("src", color.imageUrl);
        expect(screen.getByRole("radio", { name: color.name })).toHaveAttribute(
          "data-color-index",
          String(index),
        );
      });
    });

    it("exposes no hover handlers — pointing at a swatch cannot change state", async () => {
      renderView();
      const yellow = product.colorOptions[3]!;

      await userEvent.hover(screen.getByRole("radio", { name: yellow.name }));

      expect(screen.getByRole("radio", { name: yellow.name })).not.toBeChecked();
      expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
        "src",
        firstColor.imageUrl,
      );
      expect(screen.getByText(formatPrice(product.basePrice))).toBeInTheDocument();
    });
  });

  describe("one derived selection", () => {
    it("shows the first color without selecting it", () => {
      renderView();

      expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
        "src",
        firstColor.imageUrl,
      );
      expect(
        screen.getAllByRole("radio").filter((r) => r.getAttribute("aria-checked") === "true"),
      ).toHaveLength(0);
    });

    it("starts with nothing picked at all, so Add-to-cart is gated on both", () => {
      renderView();

      product.storageOptions.forEach((option) => {
        expect(screen.getByRole("radio", { name: option.capacity })).not.toBeChecked();
      });
      expect(screen.getByText(formatPrice(product.basePrice))).toBeInTheDocument();
      expect(screen.getByRole("button", { name: t("detail.add_to_cart") })).toBeDisabled();
    });

    it("defaults to the color and storage already in the cart for this phone", async () => {
      const blue = product.colorOptions[1]!;
      const lastStorage = product.storageOptions.at(-1)!;
      seedCart({ color: blue.name, storage: lastStorage.capacity });

      renderView();

      await waitFor(() => expect(screen.getByRole("radio", { name: blue.name })).toBeChecked());
      expect(screen.getByRole("img", { name: product.name })).toHaveAttribute("src", blue.imageUrl);
      expect(screen.getByText(formatPrice(lastStorage.price))).toBeInTheDocument();
      expect(screen.getByRole("button", { name: t("detail.add_to_cart") })).toBeEnabled();
    });

    it("uses the most recent cart line when the phone was added more than once", async () => {
      const blue = product.colorOptions[1]!;
      const yellow = product.colorOptions[3]!;
      seedCart(
        { color: blue.name, storage: product.storageOptions[0]!.capacity },
        { color: yellow.name, storage: product.storageOptions[0]!.capacity },
      );

      renderView();

      await waitFor(() => expect(screen.getByRole("radio", { name: yellow.name })).toBeChecked());
    });

    it("ignores a cart line whose variant the API no longer offers", async () => {
      seedCart({ color: "Discontinued Pink", storage: "4 TB" });

      renderView();
      await waitFor(() => {
        expect(screen.getAllByRole("radio").length).toBeGreaterThan(0);
      });

      expect(
        screen.getAllByRole("radio").filter((r) => r.getAttribute("aria-checked") === "true"),
      ).toHaveLength(0);
      expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
        "src",
        firstColor.imageUrl,
      );
      expect(screen.getByRole("button", { name: t("detail.add_to_cart") })).toBeDisabled();
    });

    it("lets a fresh pick override the cart's colour, keeping the cart's storage", async () => {
      const blue = product.colorOptions[1]!;
      const lastStorage = product.storageOptions.at(-1)!;
      seedCart({ color: blue.name, storage: lastStorage.capacity });
      renderView();
      await waitFor(() => expect(screen.getByRole("radio", { name: blue.name })).toBeChecked());

      await userEvent.click(screen.getByRole("radio", { name: firstColor.name }));

      expect(screen.getByRole("radio", { name: firstColor.name })).toBeChecked();
      expect(screen.getByText(formatPrice(lastStorage.price))).toBeInTheDocument();
    });
  });

  it("still renders when the API returns a product with no color options", () => {
    render(
      <CartProvider>
        <PhoneDetailView product={{ ...product, colorOptions: [] }} />
      </CartProvider>,
    );
    expect(screen.getByRole("heading", { level: 1, name: product.name })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: product.name })).not.toBeInTheDocument();
  });
});
