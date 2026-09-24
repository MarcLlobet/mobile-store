import Image from "next/image";
import type { CartItem as CartItemModel } from "@/types/cart";
import { normalizeImageUrl } from "@/lib/api/transform";
import { Price } from "@/components/primitives/Price";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import styles from "./CartItem.module.css";

/**
 * One cart line row. Purely prop-driven — it never calls `useCart()` itself,
 * so it can be rendered standalone in Storybook and reused by `CartList`
 * without any provider. `onRemove` is threaded down from `app/cart/page.tsx`
 * (the only place in this subtree that reads the cart context).
 */
export interface CartItemProps {
  item: CartItemModel;
  onRemove: (cartItemId: string) => void;
}

export function CartItem({ item, onRemove }: CartItemProps) {
  const { cartItemId, name, brand, imageUrl, color, storage, unitPrice } = item;

  return (
    <li className={styles.row}>
      <span className={styles.imageWrapper}>
        <Image
          src={normalizeImageUrl(imageUrl)}
          alt={name}
          fill
          className={styles.image}
          sizes="96px"
        />
      </span>
      <span className={styles.info}>
        <span className={styles.brand}>{brand}</span>
        <span className={styles.name}>{name}</span>
        <span className={styles.specs}>
          Color: {color} · Storage: {storage}
        </span>
        <span className={styles.price}>
          <Price value={unitPrice} />
        </span>
      </span>
      <Button
        variant="standard"
        ariaLabel={`Remove ${name} from cart`}
        onClick={() => onRemove(cartItemId)}
      >
        <Icon name="trash" ariaHidden />
      </Button>
    </li>
  );
}
