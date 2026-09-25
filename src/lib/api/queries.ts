import { queryOptions } from "@tanstack/react-query";

import { fetchProductById, fetchProducts } from "./api";

import type { FetchProductsParams } from "./types";

export const LISTING_LIMIT = 20;

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: ({ search = "", limit, offset = 0 }: FetchProductsParams = {}) =>
    [...productKeys.lists(), { search, limit: limit ?? null, offset }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const productsQuery = (params: FetchProductsParams = {}) =>
  queryOptions({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
  });

export const listingQuery = (search = "") =>
  productsQuery({ search, limit: LISTING_LIMIT, offset: 0 });

export const productQuery = (id: string) =>
  queryOptions({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
  });
