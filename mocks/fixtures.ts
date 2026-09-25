import type { ApiErrorBody, ProductDetail, ProductListItem } from "@/lib/api/types";

import invalidKeyJson from "./invalid_key.json";
import notFoundJson from "./not_found.json";
import productsJson from "./products.json";
import productDetailJson from "./products_id.json";

export const products = productsJson satisfies ProductListItem[];

export const productDetail = productDetailJson satisfies ProductDetail;

export const productDetailsById: Record<string, ProductDetail> = {
  [productDetail.id]: productDetail,
};

export const notFoundError = notFoundJson satisfies ApiErrorBody;

export const invalidKeyError = invalidKeyJson satisfies ApiErrorBody;

export const PRODUCT_WITH_DETAIL_ID = productDetail.id;
