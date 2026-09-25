import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@mocks/server";
import { scenarios } from "@mocks/handlers";
import { products } from "@mocks/fixtures";
import { LISTING_LIMIT, listingQuery } from "@/lib/api/queries";
import { createTestQueryClient, renderWithQuery } from "@/test/query";
import { trackRequests } from "@/test/requests";
import { PhoneListing } from "./PhoneListing";

/**
 * PhoneListing is exercised against the recorded catalog served by MSW, so
 * "what a search returns" is decided by the same server-side filtering the
 * real API does — not by a resolved-value stub. Nothing in the app is mocked;
 * the component runs its real React Query hook over the real transport.
 */

const firstPage = products.slice(0, LISTING_LIMIT);
const requests = trackRequests();

let queryClient = createTestQueryClient();

/**
 * Seeds the query the build-time prefetch would have hydrated (see
 * app/page.tsx), which is how this component always starts in production.
 */
function renderListing({ seed = true }: { seed?: boolean } = {}) {
  if (seed) {
    queryClient.setQueryData(listingQuery().queryKey, firstPage);
  }
  return renderWithQuery(<PhoneListing />, { queryClient });
}

beforeEach(() => {
  queryClient = createTestQueryClient();
});

describe("PhoneListing", () => {
  it("renders the prefetched first page from the hydrated cache, without re-fetching on mount", async () => {
    renderListing();

    expect(screen.getByText("Galaxy S24 Ultra")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText(`${LISTING_LIMIT} results`)).toBeInTheDocument();

    // The whole point of the build-time prefetch: no duplicate request.
    await waitFor(() => expect(requests.urls()).toEqual([]));
  });

  it("fetches the first page itself when nothing was prefetched", async () => {
    renderListing({ seed: false });

    expect(await screen.findByText("Galaxy S24 Ultra")).toBeInTheDocument();
    expect(requests.urls()).toHaveLength(1);
    expect(requests.urls()[0]).toContain("limit=20");
  });

  it("re-fetches through the API when the user searches, and renders what the API returned", async () => {
    renderListing();

    await userEvent.type(screen.getByRole("searchbox"), "iphone");

    // Only the two iPhones in the recorded catalog survive the API's filter.
    // Waiting on the count, not on a phone name: "iPhone 13" is also in the
    // unfiltered first page, so it would match before the search resolved.
    expect(await screen.findByText("2 results")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15 Pro Max")).toBeInTheDocument();
    expect(screen.getByText("iPhone 13")).toBeInTheDocument();
    expect(screen.queryByText("Galaxy S24 Ultra")).not.toBeInTheDocument();

    const searchRequest = requests.urls().at(-1);
    expect(searchRequest).toContain("search=iphone");
    expect(searchRequest).toContain("limit=20");
  });

  it("searches on brand as well as name, case-insensitively", async () => {
    renderListing();

    await userEvent.type(screen.getByRole("searchbox"), "oppo");

    await waitFor(() => expect(screen.getByText("4 results")).toBeInTheDocument());
    expect(screen.getByText("Reno 11 F")).toBeInTheDocument();
  });

  it("keeps the previous results on screen while the next search is in flight", async () => {
    renderListing();

    await userEvent.type(screen.getByRole("searchbox"), "iphone");

    // Between the keystroke settling and the response arriving, the grid still
    // shows the previous page rather than blanking out.
    expect(screen.getByText("Galaxy S24 Ultra")).toBeInTheDocument();
    await screen.findByText("2 results");
  });

  it("serves a repeated search from the cache instead of hitting the API twice", async () => {
    renderListing();
    const searchbox = screen.getByRole("searchbox");

    await userEvent.type(searchbox, "iphone");
    await screen.findByText("2 results");
    const afterFirstSearch = requests.urls().length;
    expect(afterFirstSearch).toBe(1);

    await userEvent.clear(searchbox);
    await waitFor(() => expect(screen.getByText("Galaxy S24 Ultra")).toBeInTheDocument());
    await userEvent.type(searchbox, "iphone");
    await waitFor(() => expect(screen.getByText("2 results")).toBeInTheDocument());

    // Both the cleared query and the repeated one are still-fresh cache hits.
    expect(requests.urls()).toHaveLength(afterFirstSearch);
  });

  it("shows the empty state when the API returns no matches", async () => {
    renderListing();

    await userEvent.type(screen.getByRole("searchbox"), "zzzz");

    expect(await screen.findByText("No phones match “zzzz”.")).toBeInTheDocument();
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  // The transport retries a dropped request twice with a backoff (see
  // api.ts), so the UI is legitimately allowed several seconds before it gives
  // up — this test waits that out rather than pretending failure is instant.
  it("shows an error message once the retries are exhausted", async () => {
    renderListing();
    server.use(...scenarios.networkError());

    await userEvent.type(screen.getByRole("searchbox"), "iphone");

    expect(await screen.findByRole("alert", undefined, { timeout: 10_000 })).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    // The previous results are gone, not silently left standing as if fresh.
    expect(screen.queryByText("Galaxy S24 Ultra")).not.toBeInTheDocument();
  }, 15_000);

  it("reports an invalid API key as a failure rather than an empty catalog", async () => {
    server.use(...scenarios.invalidApiKey());
    renderListing({ seed: false });

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText(/no phones match/i)).not.toBeInTheDocument();
  });
});
