import { CartItem } from "@/components/cart/CartItem";
import type { CartItem as CartItemModel } from "@/types/cart";

import styles from "./CartList.module.css";

export interface CartListProps {
  readonly items: readonly CartItemModel[];
  readonly onRemove: (cartItemId: string) => void;
}

export const CartList = ({ items, onRemove }: CartListProps) => (
  <ul className={styles.list} aria-label="Items in your cart">
    {items.map((item) => (
      <CartItem key={item.cartItemId} item={item} onRemove={onRemove} />
    ))}
  </ul>
);
