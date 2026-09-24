import type { CartItem as CartItemModel } from "@/types/cart";
import { CartItem } from "@/components/cart/CartItem";
import styles from "./CartList.module.css";

/**
 * Prop-driven list of cart rows — no `useCart()` call inside it. `items`
 * and `onRemove` are threaded down from `app/cart/page.tsx`, the single
 * place in this subtree that reads the cart context.
 */
export interface CartListProps {
  items: CartItemModel[];
  onRemove: (cartItemId: string) => void;
}

export function CartList({ items, onRemove }: CartListProps) {
  return (
    <ul className={styles.list} aria-label="Items in your cart">
      {items.map((item) => (
        <CartItem key={item.cartItemId} item={item} onRemove={onRemove} />
      ))}
    </ul>
  );
}
