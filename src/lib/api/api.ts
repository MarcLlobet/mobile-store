import type { FetchProductsParams, ProductDetail, ProductListItem } from "./types";

/**
 * Direct-to-external-API client. There is no backend of our own (this is a
 * static export deployed to GitHub Pages — see next.config.ts and the
 * README "Architecture" section), so both Server Components (at build time)
 * and Client Components (at runtime, e.g. live search) call this module,
 * which talks straight to the external API with the `x-api-key` header
 * required by the brief.
 *
 * NEXT_PUBLIC_* env vars are inlined into the client bundle at build time by
 * Next.js — this is the intended mechanism here, not an accidental leak; see
 * .env.example and the README for the full tradeoff explanation.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

// The API is hosted on Render's free tier, which has real cold starts.
// Bound every request so a sleeping instance doesn't hang the UI forever.
const FETCH_TIMEOUT_MS = 15_000;

function buildHeaders(): HeadersInit {
  return {
    "x-api-key": API_KEY,
  };
}

async function apiFetch(path: string, searchParams?: Record<string, string>): Promise<Response> {
  const url = new URL(path, API_BASE_URL);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url.toString(), {
      headers: buildHeaders(),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * GET /products?search=&limit=&offset=
 * `search` matches brand or name (API-side filtering, as required by the
 * brief's real-time search requirement).
 */
export async function fetchProducts(params: FetchProductsParams = {}): Promise<ProductListItem[]> {
  const { search, limit, offset } = params;
  const response = await apiFetch("/products", {
    search: search ?? "",
    limit: limit !== undefined ? String(limit) : "",
    offset: offset !== undefined ? String(offset) : "",
  });

  if (!response.ok) {
    throw new Error(`fetchProducts failed with status ${response.status}`);
  }

  return (await response.json()) as ProductListItem[];
}

/**
 * GET /products/{id}
 * Returns null (rather than throwing) on a 404 so callers can render a
 * not-found state; any other non-OK status still throws.
 */
export async function fetchProductById(id: string): Promise<ProductDetail | null> {
  const response = await apiFetch(`/products/${encodeURIComponent(id)}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`fetchProductById(${id}) failed with status ${response.status}`);
  }

  return (await response.json()) as ProductDetail;
}
