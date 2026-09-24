/**
 * Types for the external mobile-phones catalog API.
 *
 * Confirmed live contract (see plan "Context" section — verified against the
 * real API, not guessed):
 *   GET /products?search=&limit=&offset=
 *     -> { id, brand, name, basePrice, imageUrl }[]
 *   GET /products/{id}
 *     -> adds description, rating, specs, colorOptions, storageOptions,
 *        similarProducts (embedded — there is no separate endpoint for
 *        similar products).
 *
 * Load-bearing quirks (see plan Context §1-6):
 *   - storageOptions[].price is the ABSOLUTE price for that capacity, not a
 *     delta added to basePrice.
 *   - colorOptions only affect which image is shown — no price impact.
 *   - the live listing can contain duplicate `id`s — never key a list by raw
 *     id, use `keyFor` from ./transform.
 *   - imageUrl is sometimes served as http:// even though the API is https://
 *     — normalize with `normalizeImageUrl` from ./transform before rendering.
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

export interface ProductDetail extends ProductListItem {
  description: string;
  rating: number;
  specs: ProductSpecs;
  colorOptions: ColorOption[];
  storageOptions: StorageOption[];
  similarProducts: ProductListItem[];
}

export interface FetchProductsParams {
  search?: string;
  limit?: number;
  offset?: number;
}
