/**
 * Frozen cart contract shared by CartContext and every consumer (Header,
 * Detail's Add-to-cart, the Cart view). Do not change these shapes without
 * updating every consumer — see plan §4 "Frozen contracts for Phase 1".
 */

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  brand: string;
  imageUrl: string;
  color: string;
  storage: string;
  unitPrice: number;
}

/**
 * `cartItemId` is generated, never chosen by the caller — `addItem` mints a
 * fresh unique id per click. There is no quantity/merge concept: each
 * "Add to cart" click is its own independent line (the brief only requires
 * individual remove, not increment), so two lines holding the same variant
 * are still two lines and must be removable one at a time. Deriving the id
 * from the variant would make those two indistinguishable.
 */
export type NewCartItem = Omit<CartItem, "cartItemId">;
