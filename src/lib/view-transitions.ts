/**
 * The name that pairs a grid tile's image with the detail hero's image, so the
 * browser morphs one into the other across the navigation instead of crossfading
 * them as unrelated content.
 *
 * A `view-transition-name` has to be unique in the document while a transition
 * runs — and the catalog is not free of repeats: `XMI-RN13P5G` appears twice in
 * the first twenty items, so naming every tile would put the same name on two
 * elements and make the browser abandon the whole transition. Only one tile ever
 * wears the name: the one being pointed at, or the one just returned from.
 */
export const sharedImageName = (productId: string): string => `product-image-${productId}`;

/**
 * Which product the visitor opened last, so that coming back can morph the hero
 * down into the tile it grew out of. The listing unmounts on the way out, so the
 * tile cannot remember this itself, and the server cannot know it — hence module
 * scope rather than component state.
 *
 * Deliberately *not* persisted: it stays empty on a cold load, so a server-
 * rendered listing and its first client render agree and nothing mismatches on
 * hydration. It only ever fills in after a client-side navigation.
 */
// eslint-disable-next-line functional/no-let -- navigation-scoped memory; see above
let lastOpenedProductId: string | null = null;

export const rememberOpenedProduct = (productId: string): void => {
  lastOpenedProductId = productId;
};

/** Reads the memory and clears it: a return trip only gets to use it once. */
export const takeReturnedFromProduct = (): string | null => {
  const productId = lastOpenedProductId;
  lastOpenedProductId = null;
  return productId;
};
