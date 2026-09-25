import { http, HttpResponse } from "msw";

import type { ApiErrorBody, ProductListItem } from "@/lib/api/types";

import { invalidKeyError, notFoundError, productDetailsById, products } from "./fixtures";

/** Trims trailing slashes one at a time; `/\/+$/` backtracks super-linearly (Sonar S5852). */
const withoutTrailingSlashes = (url: string): string =>
  url.endsWith("/") ? withoutTrailingSlashes(url.slice(0, -1)) : url;

const API_BASE_URL = withoutTrailingSlashes(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://mobile-ecommerce.api.test",
);

const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

export const endpoints = {
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

export const handlers = [
  http.get(endpoints.products, ({ request }) => {
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
  }),

  http.get(endpoints.product, ({ request, params }) => {
    const unauthorized = rejectUnauthorized(request);
    if (unauthorized) return unauthorized;

    const detail = productDetailsById[String(params.id)];
    if (!detail) {
      return HttpResponse.json(notFoundError, { status: 404 });
    }
    return HttpResponse.json(detail);
  }),
];

export const scenarios = {
  invalidApiKey: () => [
    http.get(endpoints.products, () => HttpResponse.json(invalidKeyError, { status: 401 })),
    http.get(endpoints.product, () => HttpResponse.json(invalidKeyError, { status: 401 })),
  ],

  productNotFound: () => [
    http.get(endpoints.product, () => HttpResponse.json(notFoundError, { status: 404 })),
  ],

  serverError: (status = 503) => [
    http.get(endpoints.products, () => new HttpResponse(null, { status })),
    http.get(endpoints.product, () => new HttpResponse(null, { status })),
  ],

  networkError: () => [
    http.get(endpoints.products, () => HttpResponse.error()),
    http.get(endpoints.product, () => HttpResponse.error()),
  ],
};
