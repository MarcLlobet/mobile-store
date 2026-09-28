export const sharedImageName = (productId: string): string => `product-image-${productId}`;

// eslint-disable-next-line functional/no-let -- navigation-scoped memory; see above
let lastOpenedProductId: string | null = null;

export const rememberOpenedProduct = (productId: string): void => {
  lastOpenedProductId = productId;
};

export const takeReturnedFromProduct = (): string | null => {
  const productId = lastOpenedProductId;
  lastOpenedProductId = null;
  return productId;
};
