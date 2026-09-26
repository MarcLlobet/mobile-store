import { http, HttpResponse } from "msw";

import type { ApiErrorBody, ProductDetail, ProductListItem } from "@/lib/api/types";

import { invalidKeyError, notFoundError, productDetailsById, products } from "./fixtures";

const withoutTrailingSlashes = (url: string): string =>
  url.endsWith("/") ? withoutTrailingSlashes(url.slice(0, -1)) : url;

const API_BASE_URL = withoutTrailingSlashes(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://mobile-store.api.test",
);

const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

const endpoints = {
  products: `${API_BASE_URL}/products`,
  product: `${API_BASE_URL}/products/:id`,
} as const;

const rejectUnauthorized = (request: Request): HttpResponse<ApiErrorBody> | null => {
  const key = request.headers.get("x-api-key");
  if (key && key === API_KEY) {
    return null;
  }
  return HttpResponse.json(invalidKeyError, { status: 401 });
};

const parseCount = (value: string | null): number | undefined => {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return undefined;
  return parsed;
};

const matchesSearch = (product: ProductListItem, search: string): boolean => {
  const needle = search.trim().toLowerCase();
  if (needle === "") return true;
  return (
    product.brand.toLowerCase().includes(needle) || product.name.toLowerCase().includes(needle)
  );
};

export interface HandlerOverride<TBody> {
  body?: TBody | ApiErrorBody;
  status?: number;
  networkError?: boolean;
}

const overriddenResponse = <TBody>(override: HandlerOverride<TBody>): Response | null => {
  if (override.networkError === true) {
    return HttpResponse.error();
  }
  if (override.body !== undefined) {
    return HttpResponse.json(override.body, { status: override.status ?? 200 });
  }
  if (override.status !== undefined) {
    return new HttpResponse(null, { status: override.status });
  }
  return null;
};

export const getProducts = (override: HandlerOverride<readonly ProductListItem[]> = {}) =>
  http.get(endpoints.products, ({ request }) => {
    const forced = overriddenResponse(override);
    if (forced) return forced;

    const unauthorized = rejectUnauthorized(request);
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(request.url);
    const matched = products.filter((product) =>
      matchesSearch(product, searchParams.get("search") ?? ""),
    );

    const offset = parseCount(searchParams.get("offset")) ?? 0;
    const limit = parseCount(searchParams.get("limit"));
    const page =
      limit === undefined ? matched.slice(offset) : matched.slice(offset, offset + limit);

    return HttpResponse.json(page);
  });

export const getProduct = (override: HandlerOverride<ProductDetail> = {}) =>
  http.get(endpoints.product, ({ request, params }) => {
    const forced = overriddenResponse(override);
    if (forced) return forced;

    const unauthorized = rejectUnauthorized(request);
    if (unauthorized) return unauthorized;

    const detail = productDetailsById[String(params.id)];
    if (!detail) {
      return HttpResponse.json(notFoundError, { status: 404 });
    }
    return HttpResponse.json(detail);
  });

export const handlers = [getProducts(), getProduct()];
