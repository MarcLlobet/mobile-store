import Image from "next/image";

import { Price } from "@/components/primitives/Price";
import type { CartItem as CartItemModel } from "@/types/cart";

import styles from "./CartItem.module.css";

export interface CartItemProps {
  readonly item: CartItemModel;
  readonly onRemove: (cartItemId: string) => void;
}

export const CartItem = ({ item, onRemove }: CartItemProps) => {
  const { cartItemId, name, imageUrl, color, storage, unitPrice } = item;

  return (
    <li className={styles.row}>
      <span className={styles.imageWrapper}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          className={styles.image}
          sizes="(max-width: 834px) 146px, 240px"
        />
      </span>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.specs}>{`${storage} | ${color}`}</span>
        <span className={styles.price}>
          <Price value={unitPrice} />
        </span>
        <button
          type="button"
          className={styles.remove}
          aria-label={`Remove ${name} from cart`}
          onClick={() => onRemove(cartItemId)}
        >
          Eliminar
        </button>
      </div>
    </li>
  );
};
