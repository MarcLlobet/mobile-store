import { queryOptions } from "@tanstack/react-query";
import { fetchProductById, fetchProducts } from "./api";
import type { FetchProductsParams } from "./types";

/**
 * The single place query keys and fetchers are defined, so the build-time
 * prefetch in a Server Component and the `useQuery` in the Client Component
 * below it always agree on the key — that agreement is what lets the
 * dehydrated cache hydrate into the exact query the component reads, instead
 * of the component firing a duplicate request on mount.
 *
 * `fetchProducts`/`fetchProductById` talk straight to the external API (no
 * Route Handler of our own — this is a static export), so the same
 * `queryFn` runs unchanged on the server at build time and in the browser.
 */

/** The listing page size, shared by the page's prefetch and PhoneListing. */
export const LISTING_LIMIT = 20;

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  /**
   * Normalized so `{ search: undefined }` and `{ search: "" }` are the same
   * cache entry — otherwise clearing the search box would miss the data the
   * build already prefetched.
   */
  list: ({ search = "", limit, offset = 0 }: FetchProductsParams = {}) =>
    [...productKeys.lists(), { search, limit: limit ?? null, offset }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export function productsQuery(params: FetchProductsParams = {}) {
  return queryOptions({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
  });
}

/** The default listing query — what "/" prefetches and PhoneListing starts on. */
export function listingQuery(search = "") {
  return productsQuery({ search, limit: LISTING_LIMIT, offset: 0 });
}

/** Resolves to `null` for an id the API doesn't know (a 404 is not an error). */
export function productQuery(id: string) {
  return queryOptions({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
  });
}
