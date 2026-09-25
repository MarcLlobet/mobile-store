import { describe, expect, it } from "vitest";
import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import { products } from "@mocks/fixtures";
import { LISTING_LIMIT, listingQuery, productKeys, productQuery, productsQuery } from "./queries";

/**
 * The query keys are a contract between two places that never see each other:
 * the Server Component that prefetches at build time and the Client Component
 * that reads the hydrated result. If they disagree by so much as a normalized
 * default, the browser silently re-fetches everything on mount and the
 * prefetch is dead weight — which is invisible in the rendered output. Hence
 * these tests.
 */
describe("product query keys", () => {
  it("treats an absent search the same as an empty one", () => {
    expect(productKeys.list({ search: undefined, limit: 20, offset: 0 })).toEqual(
      productKeys.list({ search: "", limit: 20, offset: 0 }),
    );
  });

  it("treats an absent offset as 0", () => {
    expect(productKeys.list({ limit: 20 })).toEqual(productKeys.list({ limit: 20, offset: 0 }));
  });

  it("gives every distinct search its own cache entry", () => {
    expect(productKeys.list({ search: "apple" })).not.toEqual(
      productKeys.list({ search: "samsung" }),
    );
  });

  it("keeps lists and details in separate namespaces under one root", () => {
    expect(productKeys.list()[0]).toBe("products");
    expect(productKeys.detail("SMG-S24U")[0]).toBe("products");
    expect(productKeys.list()).not.toEqual(productKeys.detail("SMG-S24U"));
  });

  it("uses the same key for the page's prefetch and the component's query", () => {
    // app/page.tsx prefetches `listingQuery()`; PhoneListing reads
    // `listingQuery("")` for its initial, unsearched render.
    expect(listingQuery().queryKey).toEqual(listingQuery("").queryKey);
    expect(listingQuery().queryKey).toEqual(
      productsQuery({ search: "", limit: LISTING_LIMIT, offset: 0 }).queryKey,
    );
  });
});

describe("hydration", () => {
  it("carries a server-side prefetch into a client cache the hook can read", async () => {
    const server = new QueryClient();
    await server.prefetchQuery(listingQuery());

    const client = new QueryClient();
    hydrate(client, dehydrate(server));

    expect(client.getQueryData(listingQuery().queryKey)).toHaveLength(LISTING_LIMIT);
    expect(client.getQueryData(productsQuery({ limit: LISTING_LIMIT }).queryKey)).toBeDefined();
  });

  it("hydrates a detail prefetch under the id the route was built for", async () => {
    const id = products[0].id;
    const server = new QueryClient();
    await server.prefetchQuery(productQuery(id));

    const client = new QueryClient();
    hydrate(client, dehydrate(server));

    expect(client.getQueryData(productQuery(id).queryKey)).toMatchObject({ id });
  });
});
