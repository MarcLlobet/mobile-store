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

export type NewCartItem = Omit<CartItem, "cartItemId">;
