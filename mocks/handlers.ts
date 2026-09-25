/**
 * MSW handlers that stand in for the external catalog API, serving the
 * recorded responses in `./fixtures.ts`.
 *
 * These are a *faithful fake*, not a stub: they check the `x-api-key` header
 * the brief requires, and they implement `search`/`limit`/`offset` the way
 * the real endpoint does, so tests exercise the same request-building code
 * (`src/lib/api/api.ts`) and the same server-side filtering the app relies
 * on for real-time search. Nothing in the app is mocked away — only the
 * network boundary is.
 */
import { http, HttpResponse } from "msw";
import type { ApiErrorBody, ProductListItem } from "@/lib/api/types";
import { invalidKeyError, notFoundError, productDetailsById, products } from "./fixtures";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://mobile-ecommerce.api.test"
).replace(/\/+$/, "");

const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

export const endpoints = {
  products: `${API_BASE_URL}/products`,
  product: `${API_BASE_URL}/products/:id`,
} as const;

/**
 * Every endpoint is key-protected. Returns the 401 response when the request
 * is missing the header or sends the wrong key, `null` when it may proceed.
 */
function rejectUnauthorized(request: Request): HttpResponse<ApiErrorBody> | null {
  const key = request.headers.get("x-api-key");
  if (key && key === API_KEY) {
    return null;
  }
  return HttpResponse.json(invalidKeyError, { status: 401 });
}

function parseCount(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return undefined;
  return parsed;
}

/** `search` matches brand OR name, case-insensitively (API-side filtering). */
function matchesSearch(product: ProductListItem, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (needle === "") return true;
  return (
    product.brand.toLowerCase().includes(needle) || product.name.toLowerCase().includes(needle)
  );
}

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
      // Also the response for a catalog id we simply have not recorded a
      // detail fixture for yet — add it to `fixtures.ts` when a test needs it.
      return HttpResponse.json(notFoundError, { status: 404 });
    }
    return HttpResponse.json(detail);
  }),
];

/**
 * Failure modes a test can opt into with `server.use(...scenarios.x())`.
 * Each one overrides both endpoints so it applies wherever the request came
 * from.
 */
export const scenarios = {
  /** 401 + the recorded `invalid_key.json` body. */
  invalidApiKey: () => [
    http.get(endpoints.products, () => HttpResponse.json(invalidKeyError, { status: 401 })),
    http.get(endpoints.product, () => HttpResponse.json(invalidKeyError, { status: 401 })),
  ],

  /** 404 + the recorded `not_found.json` body for every id. */
  productNotFound: () => [
    http.get(endpoints.product, () => HttpResponse.json(notFoundError, { status: 404 })),
  ],

  /** A 5xx from the upstream — what a cold/overloaded Render instance does. */
  serverError: (status = 503) => [
    http.get(endpoints.products, () => new HttpResponse(null, { status })),
    http.get(endpoints.product, () => new HttpResponse(null, { status })),
  ],

  /** A dropped connection — the other way a sleeping free-tier instance fails. */
  networkError: () => [
    http.get(endpoints.products, () => HttpResponse.error()),
    http.get(endpoints.product, () => HttpResponse.error()),
  ],
};
