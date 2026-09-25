/**
 * The JSON files next to this module are the recorded contract of the
 * external mobile-phones catalog API (captured with the Bruno collection in
 * `bruno/`). They are the single source of truth for every test: the MSW
 * handlers in `./handlers.ts` serve them, and the `satisfies` clauses below
 * make a drift between a recorded response and `src/lib/api/types.ts` a
 * type error rather than a runtime surprise.
 *
 * To record another response, add the JSON here and register it below —
 * never hand-write a fixture that the API has not actually returned.
 */
import type { ApiErrorBody, ProductDetail, ProductListItem } from "@/lib/api/types";

import invalidKeyJson from "./invalid_key.json";
import notFoundJson from "./not_found.json";
import productDetailJson from "./products_id.json";
import productsJson from "./products.json";

/**
 * `GET /products` — the full catalog (24 items). Note the recorded quirks:
 * `XMI-RN13P5G` appears twice, brand casing is inconsistent
 * ("Xiaomi" vs "XIAOMI"), and `imageUrl` is served over plain http://.
 */
export const products = productsJson satisfies ProductListItem[];

/**
 * `GET /products/{id}` — one recorded detail response. Note it carries **no
 * top-level `imageUrl`**: the detail view's images all come from
 * `colorOptions[].imageUrl`.
 */
export const productDetail = productDetailJson satisfies ProductDetail;

/** Every detail response we have recorded, keyed by id. */
export const productDetailsById: Record<string, ProductDetail> = {
  [productDetail.id]: productDetail,
};

/** `GET /products/{unknown-id}` — HTTP 404. */
export const notFoundError = notFoundJson satisfies ApiErrorBody;

/** Any endpoint without a valid `x-api-key` — HTTP 401. */
export const invalidKeyError = invalidKeyJson satisfies ApiErrorBody;

/** Convenience: the first catalog id that has a recorded detail response. */
export const PRODUCT_WITH_DETAIL_ID = productDetail.id;
