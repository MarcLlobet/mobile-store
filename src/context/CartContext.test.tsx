import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NewCartItem } from "@/types/cart";

import { CART_STORAGE_KEY, CartProvider, useCart } from "./CartContext";

const baseItem: NewCartItem = {
  productId: "APL-IP15PM",
  name: "iPhone 15 Pro Max",
  brand: "Apple",
  imageUrl: "https://example.com/iphone.png",
  color: "Black",
  storage: "256GB",
  unitPrice: 1319,
};

const renderCart = () => renderHook(() => useCart(), { wrapper: CartProvider });

/** Adds the same line `times` over, so each call has to mint its own id. */
const addRepeatedly = (addItem: (item: NewCartItem) => void, times: number) => {
  Array.from({ length: times }).forEach(() => {
    addItem(baseItem);
  });
};

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

  it("addItem appends a line carrying the item plus a generated cartItemId", async () => {
    const { result } = renderCart();
    await waitFor(() => expect(result.current.items).toEqual([]));

    act(() => {
      result.current.addItem(baseItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject(baseItem);
    expect(result.current.items[0]?.cartItemId).toEqual(expect.any(String));
    expect(result.current.items[0]?.cartItemId).not.toBe("");
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
    const blackLineId = result.current.items[0]!.cartItemId;

    act(() => {
      result.current.removeItem(blackLineId);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.color).toBe("Blue");
  });

  describe("repeated adds of one identical variant", () => {
    it("gives every line its own id", async () => {
      const { result } = renderCart();
      await waitFor(() => expect(result.current.items).toEqual([]));

      act(() => {
        addRepeatedly(result.current.addItem, 5);
      });

      expect(result.current.items).toHaveLength(5);
      const ids = result.current.items.map((item) => item.cartItemId);
      expect(new Set(ids).size).toBe(5);
    });

    it("removes exactly the one line asked for, leaving the rest", async () => {
      const { result } = renderCart();
      await waitFor(() => expect(result.current.items).toEqual([]));

      act(() => {
        addRepeatedly(result.current.addItem, 5);
      });
      const secondLine = result.current.items[1]!;

      act(() => {
        result.current.removeItem(secondLine.cartItemId);
      });

      expect(result.current.items).toHaveLength(4);
      expect(result.current.itemCount).toBe(4);
      expect(result.current.totalPrice).toBe(1319 * 4);
      expect(result.current.items.map((i) => i.cartItemId)).not.toContain(secondLine.cartItemId);
      expect(result.current.items.every((i) => i.color === baseItem.color)).toBe(true);
    });

    it("can be emptied one line at a time", async () => {
      const { result } = renderCart();
      await waitFor(() => expect(result.current.items).toEqual([]));

      act(() => {
        addRepeatedly(result.current.addItem, 3);
      });

      [2, 1, 0].forEach((expected) => {
        act(() => {
          result.current.removeItem(result.current.items[0]!.cartItemId);
        });
        expect(result.current.items).toHaveLength(expected);
      });
    });

    it("keeps the lines distinguishable across a reload", async () => {
      const { result, unmount } = renderCart();
      await waitFor(() => expect(result.current.items).toEqual([]));

      act(() => {
        addRepeatedly(result.current.addItem, 3);
      });
      await waitFor(() =>
        expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]")).toHaveLength(3),
      );
      unmount();

      const { result: reloaded } = renderCart();
      await waitFor(() => expect(reloaded.current.items).toHaveLength(3));

      act(() => {
        reloaded.current.removeItem(reloaded.current.items[1]!.cartItemId);
      });
      expect(reloaded.current.items).toHaveLength(2);
    });

    it("repairs a cart persisted before ids were unique", async () => {
      const legacyId = "APL-IP15PM-Black-256GB";
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify([
          { ...baseItem, cartItemId: legacyId },
          { ...baseItem, cartItemId: legacyId },
          { ...baseItem, cartItemId: legacyId },
        ]),
      );

      const { result } = renderCart();
      await waitFor(() => expect(result.current.items).toHaveLength(3));

      const ids = result.current.items.map((item) => item.cartItemId);
      expect(new Set(ids).size).toBe(3);

      act(() => {
        result.current.removeItem(ids[0]!);
      });
      expect(result.current.items).toHaveLength(2);
    });
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
    const storedId = result.current.items[0]!.cartItemId;

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
    expect(result2.current.items[0]?.cartItemId).toBe(storedId);
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
    const spy = vi.spyOn(console, "error").mockImplementation(vi.fn());
    expect(() => renderHook(() => useCart())).toThrow(/useCart must be used within a CartProvider/);
    spy.mockRestore();
  });
});
