import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CART_STORAGE_KEY, CartProvider, useCart } from "./CartContext";
import type { NewCartItem } from "@/types/cart";

const baseItem: NewCartItem = {
  productId: "APL-IP15PM",
  name: "iPhone 15 Pro Max",
  brand: "Apple",
  imageUrl: "https://example.com/iphone.png",
  color: "Black",
  storage: "256GB",
  unitPrice: 1319,
};

function renderCart() {
  return renderHook(() => useCart(), { wrapper: CartProvider });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("CartContext", () => {
  it("starts empty", async () => {
    const { result } = renderCart();
    await waitFor(() => {
      expect(result.current.items).toEqual([]);
    });
    expect(result.current.itemCount).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("addItem builds cartItemId as `${productId}-${color}-${storage}` and appends", async () => {
    const { result } = renderCart();
    await waitFor(() => expect(result.current.items).toEqual([]));

    act(() => {
      result.current.addItem(baseItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.cartItemId).toBe("APL-IP15PM-Black-256GB");
    expect(result.current.itemCount).toBe(1);
    expect(result.current.totalPrice).toBe(1319);
  });

  it("does not merge duplicate add-to-cart clicks — each is its own line", async () => {
    const { result } = renderCart();
    await waitFor(() => expect(result.current.items).toEqual([]));

    act(() => {
      result.current.addItem(baseItem);
      result.current.addItem(baseItem);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.itemCount).toBe(2);
    expect(result.current.totalPrice).toBe(2638);
  });

  it("removeItem removes exactly one line by cartItemId", async () => {
    const { result } = renderCart();
    await waitFor(() => expect(result.current.items).toEqual([]));

    act(() => {
      result.current.addItem(baseItem);
      result.current.addItem({ ...baseItem, color: "Blue" });
    });
    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.removeItem("APL-IP15PM-Black-256GB");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.color).toBe("Blue");
  });

  it("itemCount and totalPrice derive from the current items array", async () => {
    const { result } = renderCart();
    await waitFor(() => expect(result.current.items).toEqual([]));

    act(() => {
      result.current.addItem(baseItem);
      result.current.addItem({ ...baseItem, color: "Blue", unitPrice: 1449, storage: "512GB" });
    });

    expect(result.current.itemCount).toBe(2);
    expect(result.current.totalPrice).toBe(1319 + 1449);
  });

  it("persists to localStorage under the frozen key and round-trips across mounts", async () => {
    const { result, unmount } = renderCart();
    await waitFor(() => expect(result.current.items).toEqual([]));

    act(() => {
      result.current.addItem(baseItem);
    });

    await waitFor(() => {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw ?? "[]")).toHaveLength(1);
    });

    unmount();

    const { result: result2 } = renderCart();
    await waitFor(() => {
      expect(result2.current.items).toHaveLength(1);
    });
    expect(result2.current.items[0]?.cartItemId).toBe("APL-IP15PM-Black-256GB");
  });

  it("does not throw on corrupt localStorage JSON, falling back to an empty cart", async () => {
    window.localStorage.setItem(CART_STORAGE_KEY, "{not valid json");

    const { result } = renderCart();
    await waitFor(() => {
      expect(result.current.items).toEqual([]);
    });
  });

  it("does not throw when localStorage holds valid JSON that is not an array", async () => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ not: "an array" }));

    const { result } = renderCart();
    await waitFor(() => {
      expect(result.current.items).toEqual([]);
    });
  });

  it("throws a clear error when useCart is used outside CartProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow(/useCart must be used within a CartProvider/);
    spy.mockRestore();
  });
});
