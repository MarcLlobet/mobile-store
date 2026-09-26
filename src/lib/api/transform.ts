import type { ColorOption, ProductDetail, ProductListItem } from "./types";

export type RawProductDetail = Omit<ProductDetail, "colorOptions" | "similarProducts"> & {
  colorOptions?: readonly ColorOption[];
  similarProducts?: readonly ProductListItem[];
};

export const normalizeImageUrl = (url: string): string => {
  const urlObject = new URL(url);
  if (urlObject.protocol === "https:") {
    return url;
  }
  // eslint-disable-next-line functional/immutable-data
  urlObject.protocol = "https:";
  return urlObject.href;
};

export const normalizeListItem = (product: ProductListItem): ProductListItem => ({
  ...product,
  imageUrl: normalizeImageUrl(product.imageUrl),
});

const normalizeColorOption = (color: ColorOption): ColorOption => ({
  ...color,
  imageUrl: normalizeImageUrl(color.imageUrl),
});

export const normalizeProductDetail = (product: RawProductDetail): ProductDetail => ({
  ...product,
  colorOptions: (product.colorOptions ?? []).map((color) => normalizeColorOption(color)),
  similarProducts: (product.similarProducts ?? []).map((item) => normalizeListItem(item)),
});

export const keyFor = (product: { id: string }, index: number): string => `${product.id}-${index}`;
