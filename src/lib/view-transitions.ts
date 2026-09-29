export const sharedImageName = (productId: string): string => `product-image-${productId}`;

// eslint-disable-next-line functional/no-let -- deliberately not persisted: it must be empty on a cold load so the server-rendered listing and its first client render agree, and it only ever fills in after a client-side navigation
let lastOpenedProductId: string | null = null;

export const rememberOpenedProduct = (productId: string): void => {
  lastOpenedProductId = productId;
};

export const takeReturnedFromProduct = (): string | null => {
  const productId = lastOpenedProductId;
  lastOpenedProductId = null;
  return productId;
};
