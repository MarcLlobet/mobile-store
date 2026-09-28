import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LISTING_LIMIT } from "@/lib/api/catalog";
import { normalizeList } from "@/lib/api/transform";
import { buildSearchTree } from "@/lib/search";
import { trackRequests } from "@/test/requests";
import { products } from "@mocks/fixtures";

import { PhoneListing } from "./PhoneListing";

const catalog = normalizeList(products);
const searchTree = buildSearchTree(catalog);

const requests = trackRequests();

const renderListing = () => render(<PhoneListing catalog={catalog} searchTree={searchTree} />);

const search = async (query: string) => {
  await userEvent.type(screen.getByRole("searchbox"), query);
};

describe("PhoneListing", () => {
  it("shows the first page of the catalog the build handed it", () => {
    renderListing();

    expect(screen.getByText("Galaxy S24 Ultra")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText(`${String(LISTING_LIMIT)} results`)).toBeInTheDocument();
  });

  it.each([
    ["a whole word", "iphone", "2 results", "iPhone 13"],
    ["a prefix, before the word is finished", "ipho", "2 results", "iPhone 15 Pro Max"],
    ["a brand, case-insensitively", "xiaomi", "7 results", "Redmi 13C"],
    ["every word of a two-word query", "galaxy ultra", "1 result", "Galaxy S24 Ultra"],
  ])("matches on %s", async (_case, query, count, visible) => {
    renderListing();

    await search(query);

    expect(await screen.findByText(count)).toBeInTheDocument();
    expect(screen.getByText(visible)).toBeInTheDocument();
  });

  it("drops the phones that do not match", async () => {
    renderListing();

    await search("iphone");

    expect(await screen.findByText("2 results")).toBeInTheDocument();
    expect(screen.queryByText("Galaxy S24 Ultra")).not.toBeInTheDocument();
    expect(screen.queryByText("Pixel 8a")).not.toBeInTheDocument();
  });

  it("finds a phone past the first page, because the tree covers the whole catalog", async () => {
    renderListing();

    expect(screen.queryByText("Note 50")).not.toBeInTheDocument();

    await search("realme");

    expect(await screen.findByText("1 result")).toBeInTheDocument();
    expect(screen.getByText("Note 50")).toBeInTheDocument();
  });

  it("clears without waiting for the debounce", async () => {
    renderListing();
    const searchbox = screen.getByRole("searchbox");

    await userEvent.type(searchbox, "iphone");
    expect(await screen.findByText("2 results")).toBeInTheDocument();

    await userEvent.clear(searchbox);

    expect(screen.getByText(`${String(LISTING_LIMIT)} results`)).toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", async () => {
    renderListing();

    await search("zzzz");

    expect(await screen.findByText("No phones match “zzzz”.")).toBeInTheDocument();
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("never reaches the network — mounting or searching", async () => {
    renderListing();

    await search("iphone oppo realme");
    await userEvent.clear(screen.getByRole("searchbox"));
    await search("galaxy");
    await userEvent.clear(screen.getByRole("searchbox"));

    expect(requests.urls()).toEqual([]);
  });
});
