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
 * `cartItemId` is derived, never chosen by the caller — `addItem` builds it
 * as `${productId}-${color}-${storage}`. There is no quantity/merge concept:
 * each "Add to cart" click is its own independent line (brief only requires
 * individual remove, not increment).
 */
export type NewCartItem = Omit<CartItem, "cartItemId">;
