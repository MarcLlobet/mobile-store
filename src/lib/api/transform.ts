import { normalizeImageUrl } from "@/lib/utils/normalizeImageUrl";

import type { ColorOption, ProductDetail, ProductListItem } from "./types";

export type RawProductDetail = Omit<ProductDetail, "colorOptions" | "similarProducts"> & {
  colorOptions?: ColorOption[];
  similarProducts?: ProductListItem[];
};

const normalizeListItem = (product: ProductListItem): ProductListItem => ({
  ...product,
  imageUrl: normalizeImageUrl(product.imageUrl),
});

export const normalizeList = (products: ProductListItem[]): ProductListItem[] =>
  products.map((product) => normalizeListItem(product));

const normalizeColorOption = (color: ColorOption): ColorOption => ({
  ...color,
  imageUrl: normalizeImageUrl(color.imageUrl),
});

export const normalizeProductDetail = (product: RawProductDetail): ProductDetail => ({
  ...product,
  colorOptions: (product.colorOptions ?? []).map((color) => normalizeColorOption(color)),
  similarProducts: normalizeList(product.similarProducts ?? []),
});

export const keyFor = (product: { id: string }, index: number): string => `${product.id}-${index}`;
