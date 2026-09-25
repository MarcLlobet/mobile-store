/**
 * Types for the external mobile-phones catalog API.
 *
 * Every type here is pinned to a *recorded* response in `mocks/` (captured
 * with the `bruno/` collection). `mocks/fixtures.ts` asserts each fixture
 * `satisfies` the matching type, so this file and the real payloads cannot
 * drift apart silently.
 *
 *   GET /products?search=&limit=&offset=   -> ProductListItem[]  (mocks/products.json)
 *   GET /products/{id}                     -> ProductDetail      (mocks/products_id.json)
 *   GET /products/{unknown}                -> 404 ApiErrorBody   (mocks/not_found.json)
 *   any request without a valid x-api-key  -> 401 ApiErrorBody   (mocks/invalid_key.json)
 *
 * Load-bearing quirks, all visible in the recorded responses:
 *   - `ProductDetail` has NO top-level `imageUrl`. Only the listing shape
 *     carries one; on the detail view every image comes from
 *     `colorOptions[].imageUrl`. This is why ProductDetail does not extend
 *     ProductListItem.
 *   - storageOptions[].price is the ABSOLUTE price for that capacity, not a
 *     delta added to basePrice — and it can be *lower* than basePrice
 *     (SMG-S24U: basePrice 1329, 256 GB 1229).
 *   - colorOptions only affect which image is shown — no price impact.
 *   - the listing can contain duplicate `id`s (XMI-RN13P5G appears twice) —
 *     never key a list by raw id, use `keyFor` from ./transform.
 *   - brand casing is inconsistent ("Xiaomi" and "XIAOMI" both appear), so
 *     any brand matching must be case-insensitive.
 *   - imageUrl is served as http:// even though the API is https:// —
 *     normalize with `normalizeImageUrl` from ./transform before rendering.
 */

export interface ProductListItem {
  id: string;
  brand: string;
  name: string;
  basePrice: number;
  imageUrl: string;
}

export interface ColorOption {
  name: string;
  hexCode: string;
  imageUrl: string;
}

export interface StorageOption {
  capacity: string;
  price: number;
}

export interface ProductSpecs {
  screen: string;
  resolution: string;
  processor: string;
  mainCamera: string;
  selfieCamera: string;
  battery: string;
  os: string;
  screenRefreshRate: string;
}

/**
 * Deliberately NOT `extends ProductListItem`: the recorded detail response
 * has no `imageUrl` (see the file header). Everything else the listing shape
 * carries is repeated here, so the fields are spelled out.
 */
export interface ProductDetail {
  id: string;
  brand: string;
  name: string;
  basePrice: number;
  description: string;
  rating: number;
  specs: ProductSpecs;
  colorOptions: ColorOption[];
  storageOptions: StorageOption[];
  /** Embedded in the detail response — there is no separate endpoint. */
  similarProducts: ProductListItem[];
}

export interface FetchProductsParams {
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Error body shape shared by every non-OK response — e.g.
 * `{ error: "NOT-FOUND", message: "Product not found" }` (404) and
 * `{ error: "UNAUTHORIZED", message: "Invalid API key" }` (401).
 */
export interface ApiErrorBody {
  error: string;
  message: string;
}
