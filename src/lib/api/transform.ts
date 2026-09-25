import type { ColorOption, ProductDetail, ProductListItem } from "./types";

const HTTP_PREFIX = "http://";

/**
 * Detail as it arrives off the wire. Nothing validates the response at runtime,
 * so the collections are optional here even though `ProductDetail` guarantees
 * them to the rest of the app — normalising is what closes that gap.
 */
export type RawProductDetail = Omit<ProductDetail, "colorOptions" | "similarProducts"> & {
  readonly colorOptions?: readonly ColorOption[];
  readonly similarProducts?: readonly ProductListItem[];
};

export const normalizeImageUrl = (url: string): string =>
  url.startsWith(HTTP_PREFIX) ? `https://${url.slice(HTTP_PREFIX.length)}` : url;

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

export const keyFor = (product: { readonly id: string }, index: number): string =>
  `${product.id}-${index}`;
