import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { normalizeListItem } from "@/lib/api/transform";
import { trackRequests } from "@/test/requests";
import { invalidKeyError, products } from "@mocks/fixtures";
import { getProducts } from "@mocks/handlers";
import { server } from "@mocks/server";

import { PhoneListing } from "./PhoneListing";
import { LISTING_LIMIT } from "./useProductSearch";

const firstPage = products.slice(0, LISTING_LIMIT).map((product) => normalizeListItem(product));
const requests = trackRequests();

const renderListing = () => render(<PhoneListing initialProducts={firstPage} />);

describe("PhoneListing", () => {
  it("renders the products the build handed it, without a request on mount", async () => {
    renderListing();

    expect(screen.getByText("Galaxy S24 Ultra")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText(`${String(LISTING_LIMIT)} results`)).toBeInTheDocument();

    await waitFor(() => {
      expect(requests.urls()).toEqual([]);
    });
  });

  it("searches through the API and renders what it returned", async () => {
    renderListing();

    await userEvent.type(screen.getByRole("searchbox"), "iphone");

    expect(await screen.findByText("2 results")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("iPhone 13")).toBeInTheDocument();
    expect(screen.queryByText("Galaxy S24 Ultra")).not.toBeInTheDocument();

    expect(requests.urls().at(-1)).toContain("search=iphone");
  });

  it("debounces a burst of keystrokes into one request", async () => {
    renderListing();

    await userEvent.type(screen.getByRole("searchbox"), "oppo");
    await waitFor(() => {
      expect(screen.getByText("4 results")).toBeInTheDocument();
    });

    expect(requests.urls()).toHaveLength(1);
  });

  it("searches on brand as well as name, case-insensitively", async () => {
    renderListing();

    await userEvent.type(screen.getByRole("searchbox"), "xiaomi");

    await waitFor(() => {
      expect(screen.getByText("Redmi 13C")).toBeInTheDocument();
    });
  });

  it("restores the build's products without a request when the query is cleared", async () => {
    renderListing();
    const searchbox = screen.getByRole("searchbox");

    await userEvent.type(searchbox, "iphone");
    await screen.findByText("2 results");
    const afterSearch = requests.urls().length;

    await userEvent.clear(searchbox);

    await waitFor(() => {
      expect(screen.getByText(`${String(LISTING_LIMIT)} results`)).toBeInTheDocument();
    });
    expect(requests.urls()).toHaveLength(afterSearch);
  });

  it("shows the empty state when the API returns no matches", async () => {
    renderListing();

    await userEvent.type(screen.getByRole("searchbox"), "zzzz");

    expect(await screen.findByText("No phones match “zzzz”.")).toBeInTheDocument();
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("surfaces a failed search immediately, without waiting out a retry backoff", async () => {
    renderListing();
    server.use(getProducts({ networkError: true }));

    const startedAt = Date.now();
    await userEvent.type(screen.getByRole("searchbox"), "iphone");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(Date.now() - startedAt).toBeLessThan(2000);
  });

  it("reports an invalid API key as a failure rather than an empty catalog", async () => {
    renderListing();
    server.use(getProducts({ body: invalidKeyError, status: 401 }));

    await userEvent.type(screen.getByRole("searchbox"), "iphone");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText(/no phones match/i)).not.toBeInTheDocument();
  });
});
