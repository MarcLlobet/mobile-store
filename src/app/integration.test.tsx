import { useState } from "react";

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { PhoneDetail } from "@/components/detail/PhoneDetail";
import { PhoneListing } from "@/components/listing/PhoneListing";
import { CartProvider } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils/formatPrice";
import { createTestQueryClient, renderWithQuery } from "@/test/query";
import { trackRequests } from "@/test/requests";
import { productDetail } from "@mocks/fixtures";

import CartPage from "./cart/page";

const product = productDetail;
const secondColor = product.colorOptions[1]!;
const topStorage = product.storageOptions.at(-1)!;

const requests = trackRequests();

type Screen = "listing" | "detail" | "cart";

const TestApp = () => {
  const [screen, setScreen] = useState<Screen>("listing");
  const [productId, setProductId] = useState<string | null>(null);

  const handleClickCapture = (event: React.MouseEvent) => {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;
    const match = /^\/phones\/(.+)$/.exec(anchor.getAttribute("href") ?? "");
    if (!match) return;
    event.preventDefault();
    setProductId(match[1] ?? null);
    setScreen("detail");
  };

  return (
    <div onClickCapture={handleClickCapture}>
      {screen === "listing" ? <PhoneListing /> : null}
      {screen === "detail" && productId ? <PhoneDetail id={productId} /> : null}
      {screen === "cart" ? <CartPage /> : null}
      {screen === "cart" ? null : (
        <button type="button" onClick={() => setScreen("cart")}>
          View cart (test stand-in for Header&apos;s cart link)
        </button>
      )}
      {screen === "cart" ? (
        <button type="button" onClick={() => setScreen("listing")}>
          Back to listing (test stand-in)
        </button>
      ) : null}
    </div>
  );
};

const renderApp = () =>
  renderWithQuery(<TestApp />, {
    queryClient: createTestQueryClient(),
    wrap: (children) => <CartProvider>{children}</CartProvider>,
  });

beforeEach(() => {
  window.localStorage.clear();
});

describe("Listing -> Detail -> Cart integration", () => {
  it("walks search -> select a card -> add to cart -> cart shows it -> remove -> zero state", async () => {
    renderApp();

    await screen.findByText(product.name);
    await userEvent.type(screen.getByRole("searchbox"), product.name);
    expect(await screen.findByText("1 result")).toBeInTheDocument();
    expect(screen.queryByText("Pixel 8a")).not.toBeInTheDocument();
    expect(requests.urls().at(-1)).toContain("search=Galaxy+S24+Ultra");

    await userEvent.click(screen.getByRole("link", { name: new RegExp(product.name) }));
    expect(
      await screen.findByRole("heading", { level: 1, name: product.name }),
    ).toBeInTheDocument();
    expect(requests.urls().at(-1)).toContain(`/products/${product.id}`);
    expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
      "src",
      product.colorOptions[0]!.imageUrl.replace(/^http:/, "https:"),
    );

    const addToCart = screen.getByRole("button", { name: "Añadir" });
    expect(addToCart).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: secondColor.name }));
    await userEvent.click(screen.getByRole("radio", { name: topStorage.capacity }));
    expect(addToCart).toBeEnabled();
    await userEvent.click(addToCart);

    await userEvent.click(screen.getByRole("button", { name: /view cart/i }));
    expect(await screen.findByText(product.name)).toBeInTheDocument();
    expect(screen.getByText(`${topStorage.capacity} | ${secondColor.name}`)).toBeInTheDocument();
    const totalRow = screen.getByText("Total").closest("div");
    expect(totalRow).not.toBeNull();
    expect(within(totalRow!).getByText(formatPrice(topStorage.price))).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: `Remove ${product.name} from cart` }));
    expect(screen.getByRole("heading", { level: 1, name: "Cart (0)" })).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("reuses the shared React Query cache when navigating back to the listing", async () => {
    renderApp();

    await screen.findByText(product.name);
    await userEvent.click(screen.getByRole("link", { name: new RegExp(product.name) }));
    await screen.findByRole("heading", { level: 1, name: product.name });

    await userEvent.click(screen.getByRole("button", { name: /view cart/i }));
    await screen.findByRole("heading", { level: 1, name: "Cart (0)" });

    const beforeReturning = requests.urls().length;
    await userEvent.click(screen.getByRole("button", { name: /back to listing/i }));

    expect(await screen.findByText(product.name)).toBeInTheDocument();
    await waitFor(() => expect(requests.urls()).toHaveLength(beforeReturning));
  });
});
