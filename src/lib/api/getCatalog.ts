import { fetchProducts } from "./api";
import { CATALOG_SIZE } from "./catalog";

import type { ProductListItem } from "./types";

export const getCatalog = (): Promise<readonly ProductListItem[]> =>
  fetchProducts({ limit: CATALOG_SIZE, offset: 0 });
