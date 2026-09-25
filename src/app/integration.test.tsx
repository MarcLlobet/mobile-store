import { useState } from "react";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { productDetail } from "@mocks/fixtures";
import { CartProvider } from "@/context/CartContext";
import { createTestQueryClient, renderWithQuery } from "@/test/query";
import { trackRequests } from "@/test/requests";
import { PhoneListing } from "@/components/listing/PhoneListing";
import { PhoneDetail } from "@/components/detail/PhoneDetail";
import CartPage from "./cart/page";

/**
 * End-to-end walk across the three views, over MSW serving the recorded API
 * responses in `mocks/` — so the data crossing each seam is the data the real
 * API returns, and every request the app makes really goes out (and is really
 * cached) instead of being stubbed per call site.
 *
 * Unit tests already cover each view standalone; this test exercises the
 * *seams*: the same `QueryClientProvider` carrying the catalog from the
 * listing's search into the Detail route's fetch, and the same `CartProvider`
 * carrying a Detail "Add to cart" click through to what the Cart view renders.
 *
 * Real `next/link` navigation cannot be followed inside jsdom (there is no
 * mounted App Router), so `TestApp` below stands in for the router: it
 * intercepts the anchor click the same way a browser would (reads its `href`)
 * and swaps to the Detail view. Note it does *not* fetch anything itself —
 * `PhoneDetail` pulls the product through React Query, exactly as it does in
 * the app. The "view cart" trigger stands in for the Header's cart link
 * (Header's own navigation is covered by its own suite).
 */

const product = productDetail;
const [, secondColor] = product.colorOptions;
const topStorage = product.storageOptions[product.storageOptions.length - 1];

const requests = trackRequests();

function eur(value: number): string {
  return `${Math.round(value)} EUR`;
}

type Screen = "listing" | "detail" | "cart";

function TestApp() {
  const [screen, setScreen] = useState<Screen>("listing");
  const [productId, setProductId] = useState<string | null>(null);

  function handleClickCapture(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;
    const match = /^\/phones\/(.+)$/.exec(anchor.getAttribute("href") ?? "");
    if (!match) return;
    event.preventDefault();
    setProductId(match[1]);
    setScreen("detail");
  }

  return (
    <div onClickCapture={handleClickCapture}>
      {screen === "listing" && <PhoneListing />}
      {screen === "detail" && productId && <PhoneDetail id={productId} />}
      {screen === "cart" && <CartPage />}
      {screen !== "cart" && (
        <button type="button" onClick={() => setScreen("cart")}>
          View cart (test stand-in for Header&apos;s cart link)
        </button>
      )}
      {screen === "cart" && (
        <button type="button" onClick={() => setScreen("listing")}>
          Back to listing (test stand-in)
        </button>
      )}
    </div>
  );
}

function renderApp() {
  return renderWithQuery(<TestApp />, {
    queryClient: createTestQueryClient(),
    wrap: (children) => <CartProvider>{children}</CartProvider>,
  });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("Listing -> Detail -> Cart integration", () => {
  it("walks search -> select a card -> add to cart -> cart shows it -> remove -> empty state", async () => {
    renderApp();

    // 1. Listing: real-time search narrows the grid via the API's own filter.
    await screen.findByText(product.name);
    await userEvent.type(screen.getByRole("searchbox"), product.name);
    await waitFor(() => expect(screen.getByText("1 result")).toBeInTheDocument());
    expect(screen.queryByText("Pixel 8a")).not.toBeInTheDocument();
    // URLSearchParams form-encodes the spaces.
    expect(requests.urls().at(-1)).toContain("search=Galaxy+S24+Ultra");

    // 2. Click the card -> the Detail view fetches the id the card linked to
    // through React Query, and renders the recorded detail response.
    await userEvent.click(screen.getByRole("link", { name: new RegExp(product.name) }));
    expect(
      await screen.findByRole("heading", { level: 1, name: product.name }),
    ).toBeInTheDocument();
    expect(requests.urls().at(-1)).toContain(`/products/${product.id}`);
    // The detail response has no top-level imageUrl — the hero comes from the
    // first colorOption, https-normalized from the http:// the API serves.
    expect(screen.getByRole("img", { name: product.name })).toHaveAttribute(
      "src",
      product.colorOptions[0].imageUrl.replace(/^http:/, "https:"),
    );

    // 3. Add to cart stays gated until both color and storage are picked.
    const addToCart = screen.getByRole("button", { name: "Añadir" });
    expect(addToCart).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: secondColor.name }));
    await userEvent.click(screen.getByRole("radio", { name: topStorage.capacity }));
    expect(addToCart).toBeEnabled();
    await userEvent.click(addToCart);

    // 4. The Cart view (same CartProvider) carries the exact color/storage/
    // price that were selected on Detail, not defaults.
    await userEvent.click(screen.getByRole("button", { name: /view cart/i }));
    expect(await screen.findByText(product.name)).toBeInTheDocument();
    expect(
      screen.getByText(`Color: ${secondColor.name} · Storage: ${topStorage.capacity}`),
    ).toBeInTheDocument();
    const totalRow = screen.getByText("Total").closest("div");
    expect(totalRow).not.toBeNull();
    expect(within(totalRow!).getByText(eur(topStorage.price))).toBeInTheDocument();

    // 5. Remove the only line -> the Cart view falls back to its empty state.
    await userEvent.click(screen.getByRole("button", { name: `Remove ${product.name} from cart` }));
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  it("reuses the shared React Query cache when navigating back to the listing", async () => {
    renderApp();

    await screen.findByText(product.name);
    await userEvent.click(screen.getByRole("link", { name: new RegExp(product.name) }));
    await screen.findByRole("heading", { level: 1, name: product.name });

    await userEvent.click(screen.getByRole("button", { name: /view cart/i }));
    await screen.findByText("Your cart is empty.");

    const beforeReturning = requests.urls().length;
    await userEvent.click(screen.getByRole("button", { name: /back to listing/i }));

    // The catalog is still fresh in the cache the provider holds, so the
    // listing renders straight from it rather than re-requesting.
    expect(await screen.findByText(product.name)).toBeInTheDocument();
    await waitFor(() => expect(requests.urls()).toHaveLength(beforeReturning));
  });
});
