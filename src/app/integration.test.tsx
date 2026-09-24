import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider } from "@/context/CartContext";
import type { ProductDetail, ProductListItem } from "@/lib/api/types";
import { fetchProductById, fetchProducts } from "@/lib/api/api";
import { PhoneListing } from "@/components/listing/PhoneListing";
import { PhoneDetailView } from "@/components/detail/PhoneDetailView";
import CartPage from "./cart/page";

/**
 * End-to-end walk across the three views that Phase 1's three independent
 * agents built in isolation (plan §4 Phase 2, item 4). Unit tests already
 * cover each view standalone; this test instead exercises the *seams*: the
 * same `CartProvider` instance carrying state from a Detail "Add to cart"
 * click through to what the Cart view renders, and the Listing→Detail
 * click-through producing the exact product the user searched for.
 *
 * Real `next/link` navigation cannot be followed inside jsdom (there is no
 * mounted App Router), so `TestApp` below stands in for the router: it
 * intercepts the anchor click the same way a browser would (reads its
 * `href`), fetches the product exactly like `app/phones/[id]/page.tsx` does
 * at build time, and swaps to the Detail view. The "view cart" trigger below
 * stands in for clicking the Header's cart link (Header's own navigation is
 * already covered by its own test suite).
 */

vi.mock("@/lib/api/api", () => ({
  fetchProducts: vi.fn(),
  fetchProductById: vi.fn(),
}));

const galaxyS24: ProductListItem = {
  id: "SAM-GS24",
  brand: "Samsung",
  name: "Galaxy S24",
  basePrice: 899,
  imageUrl: "https://example.com/galaxy-s24.png",
};

const iPhoneListItem: ProductListItem = {
  id: "APL-IP15PM",
  brand: "Apple",
  name: "iPhone 15 Pro Max",
  basePrice: 1319,
  imageUrl: "https://example.com/iphone-list.png",
};

const initialProducts: ProductListItem[] = [iPhoneListItem, galaxyS24];

const iPhoneDetail: ProductDetail = {
  ...iPhoneListItem,
  description: "The latest iPhone.",
  rating: 4.8,
  specs: {
    screen: "6.7 inch OLED",
    resolution: "2796 x 1290",
    processor: "A17 Pro",
    mainCamera: "48MP",
    selfieCamera: "12MP",
    battery: "4441 mAh",
    os: "iOS 17",
    screenRefreshRate: "120Hz",
  },
  colorOptions: [
    { name: "Black Titanium", hexCode: "#3b3b3b", imageUrl: "https://example.com/black.png" },
    { name: "Blue Titanium", hexCode: "#3b5f8a", imageUrl: "https://example.com/blue.png" },
  ],
  storageOptions: [
    { capacity: "256GB", price: 1319 },
    { capacity: "512GB", price: 1449 },
  ],
  // Kept empty so the Detail view's own "Similar products" ProductTiles
  // don't add extra "Apple"/text matches this test would otherwise have to
  // disambiguate — SimilarProducts' rendering is already covered by its own
  // and PhoneDetailView's unit tests.
  similarProducts: [],
};

function eur(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(value);
}

type Screen = "listing" | "detail" | "cart";

/**
 * Minimal stand-in for the app's real router, sharing one `CartProvider`
 * instance across all three "pages" exactly like `app/layout.tsx` does.
 */
function TestApp() {
  const [screen, setScreen] = useState<Screen>("listing");
  const [product, setProduct] = useState<ProductDetail | null>(null);

  function handleClickCapture(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    const match = /^\/phones\/(.+)$/.exec(href);
    if (!match) return;
    event.preventDefault();
    void fetchProductById(match[1]).then((result) => {
      setProduct(result);
      setScreen("detail");
    });
  }

  return (
    <CartProvider>
      <div onClickCapture={handleClickCapture}>
        {screen === "listing" && <PhoneListing initialProducts={initialProducts} />}
        {screen === "detail" && product && <PhoneDetailView product={product} />}
        {screen === "cart" && <CartPage />}
      </div>
      {screen !== "cart" && (
        <button type="button" onClick={() => setScreen("cart")}>
          View cart (test stand-in for Header&apos;s cart link)
        </button>
      )}
    </CartProvider>
  );
}

describe("Listing -> Detail -> Cart integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(fetchProducts).mockReset();
    vi.mocked(fetchProductById).mockReset();
  });

  it("walks search -> select a card -> add to cart -> cart shows it -> remove -> empty state", async () => {
    vi.mocked(fetchProducts).mockResolvedValue([iPhoneListItem]);
    vi.mocked(fetchProductById).mockResolvedValue(iPhoneDetail);

    render(<TestApp />);

    // 1. Listing: real-time search narrows the grid to the searched phone.
    await userEvent.type(screen.getByRole("searchbox"), "iphone");
    await waitFor(() => {
      expect(fetchProducts).toHaveBeenCalledWith({ search: "iphone", limit: 20, offset: 0 });
    });
    await waitFor(() => {
      expect(screen.queryByText("Galaxy S24")).not.toBeInTheDocument();
    });
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();

    // 2. Click the card -> Detail view loads the exact product the card
    // linked to (`/phones/APL-IP15PM`), mirroring generateStaticParams'
    // per-id fetch.
    await userEvent.click(screen.getByRole("link", { name: /iPhone 15 Pro Max/ }));
    await waitFor(() => {
      expect(fetchProductById).toHaveBeenCalledWith("APL-IP15PM");
    });
    expect(
      await screen.findByRole("heading", { level: 1, name: "iPhone 15 Pro Max" }),
    ).toBeInTheDocument();

    // 3. Add to cart stays gated until both color and storage are picked.
    const addToCart = screen.getByRole("button", { name: "Add to cart" });
    expect(addToCart).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "Blue Titanium" }));
    await userEvent.click(screen.getByRole("radio", { name: /512GB/ }));
    expect(addToCart).toBeEnabled();
    await userEvent.click(addToCart);

    // 4. Navigate to the Cart view (same CartProvider instance) and verify
    // the line item carries the exact color/storage/price that were
    // selected on Detail, not defaults.
    await userEvent.click(screen.getByRole("button", { name: /view cart/i }));
    expect(await screen.findByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("Color: Blue Titanium · Storage: 512GB")).toBeInTheDocument();
    const totalRow = screen.getByText("Total").closest("div");
    expect(totalRow).not.toBeNull();
    expect(within(totalRow!).getByText(eur(1449))).toBeInTheDocument();

    // 5. Remove the only line -> the Cart view falls back to its empty state.
    await userEvent.click(
      screen.getByRole("button", { name: "Remove iPhone 15 Pro Max from cart" }),
    );
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });
});
