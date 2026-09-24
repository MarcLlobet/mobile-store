import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductListItem } from "@/lib/api/types";
import { fetchProducts } from "@/lib/api/api";
import { PhoneListing } from "./PhoneListing";

vi.mock("@/lib/api/api", () => ({
  fetchProducts: vi.fn(),
}));

const initialProducts: ProductListItem[] = [
  {
    id: "APL-IP15PM",
    brand: "Apple",
    name: "iPhone 15 Pro Max",
    basePrice: 1319,
    imageUrl: "https://example.com/1.png",
  },
  {
    id: "SAM-GS24",
    brand: "Samsung",
    name: "Galaxy S24",
    basePrice: 899,
    imageUrl: "https://example.com/2.png",
  },
];

describe("PhoneListing", () => {
  beforeEach(() => {
    vi.mocked(fetchProducts).mockReset();
  });

  it("renders the SSG-provided initial products without an extra fetch on mount", () => {
    render(<PhoneListing initialProducts={initialProducts} />);
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("Galaxy S24")).toBeInTheDocument();
    expect(fetchProducts).not.toHaveBeenCalled();
  });

  it("shows the results count for the initial products", () => {
    render(<PhoneListing initialProducts={initialProducts} />);
    expect(screen.getByText("2 results found")).toBeInTheDocument();
  });

  it("re-fetches from the API and renders the filtered results when the user searches", async () => {
    vi.mocked(fetchProducts).mockResolvedValue([initialProducts[0]]);
    render(<PhoneListing initialProducts={initialProducts} />);

    await userEvent.type(screen.getByRole("searchbox"), "iphone");

    await waitFor(() => {
      expect(fetchProducts).toHaveBeenCalledWith({ search: "iphone", limit: 20, offset: 0 });
    });

    await waitFor(() => {
      expect(screen.queryByText("Galaxy S24")).not.toBeInTheDocument();
    });
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
  });

  it("shows the empty state when a search returns zero results", async () => {
    vi.mocked(fetchProducts).mockResolvedValue([]);
    render(<PhoneListing initialProducts={initialProducts} />);

    await userEvent.type(screen.getByRole("searchbox"), "zzzz");

    await waitFor(() => {
      expect(screen.getByText("No phones match “zzzz”.")).toBeInTheDocument();
    });
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("shows an error message if the search request fails", async () => {
    vi.mocked(fetchProducts).mockRejectedValue(new Error("network down"));
    render(<PhoneListing initialProducts={initialProducts} />);

    await userEvent.type(screen.getByRole("searchbox"), "iphone");

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
