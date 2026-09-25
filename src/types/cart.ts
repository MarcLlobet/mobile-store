export interface CartItem {
  readonly cartItemId: string;
  readonly productId: string;
  readonly name: string;
  readonly brand: string;
  readonly imageUrl: string;
  readonly color: string;
  readonly storage: string;
  readonly unitPrice: number;
}

export type NewCartItem = Omit<CartItem, "cartItemId">;
