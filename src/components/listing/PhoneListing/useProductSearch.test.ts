import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { normalizeList } from "@/lib/api/transform";
import { buildSearchTree } from "@/lib/search";
import { products } from "@mocks/fixtures";

import { SEARCH_DEBOUNCE_MS, useProductSearch } from "./useProductSearch";

const catalog = normalizeList(products);
const searchTree = buildSearchTree(catalog);

const renderSearch = (initialCount = 5) =>
  renderHook(() => useProductSearch(catalog, searchTree, { initialCount }));

const names = (items: readonly { name: string }[]) => items.map((item) => item.name);

describe("useProductSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts on the first page of the catalog", () => {
    const { result } = renderSearch();

    expect(result.current.query).toBe("");
    expect(result.current.products).toHaveLength(5);
  });

  it("echoes the query back straight away, so the input never lags behind typing", () => {
    const { result } = renderSearch();

    act(() => {
      result.current.search("iph");
    });

    expect(result.current.query).toBe("iph");
  });

  it("does not filter until the typing has settled", () => {
    const { result } = renderSearch();

    act(() => {
      result.current.search("iph");
    });

    expect(result.current.products).toHaveLength(5);

    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(names(result.current.products)).toEqual(["iPhone 15 Pro Max", "iPhone 13"]);
  });

  it("filters once for a burst of keystrokes rather than once per character", () => {
    const { result } = renderSearch();

    act(() => {
      result.current.search("i");
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 50);
      result.current.search("ip");
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 50);
      result.current.search("iph");
    });

    expect(result.current.products).toHaveLength(5);

    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(names(result.current.products)).toEqual(["iPhone 15 Pro Max", "iPhone 13"]);
  });

  it("clears without waiting, because there is nothing to coalesce", () => {
    const { result } = renderSearch();

    act(() => {
      result.current.search("iphone");
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(result.current.products).toHaveLength(2);

    act(() => {
      result.current.search("");
    });

    expect(result.current.products).toHaveLength(5);
  });

  it("drops a pending query when the box is cleared before it fires", () => {
    const { result } = renderSearch();

    act(() => {
      result.current.search("iphone");
      result.current.search("");
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS * 2);
    });

    expect(result.current.products).toHaveLength(5);
  });

  it("cancels a pending query on unmount rather than setting state afterwards", () => {
    const { result, unmount } = renderSearch();

    act(() => {
      result.current.search("iphone");
    });

    unmount();

    expect(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS * 2);
    }).not.toThrow();
  });
});
