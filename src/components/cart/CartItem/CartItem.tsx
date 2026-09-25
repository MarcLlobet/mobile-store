import Image from "next/image";
import type { CartItem as CartItemModel } from "@/types/cart";
import { normalizeImageUrl } from "@/lib/api/transform";
import { Price } from "@/components/primitives/Price";
import styles from "./CartItem.module.css";

/**
 * One cart line, laid out as the Figma cart frames show it: the product photo
 * on the left, and a text column beside it holding the name, the
 * "<storage> | <color>" line and the price at the top, with the remove control
 * pushed to the bottom of that column so it lines up with the bottom of the
 * photo.
 *
 * The remove control is a red text link ("Eliminar"), not an icon button. Its
 * visible label comes from CSS/`children` while `aria-label` stays the fully
 * qualified "Remove <name> from cart" — with several rows on screen, "Eliminar"
 * alone would be ambiguous to a screen reader listing the page's controls.
 *
 * Purely prop-driven — it never calls `useCart()` itself, so it can be rendered
 * standalone in Storybook and reused by `CartList` without any provider.
 */
export interface CartItemProps {
  item: CartItemModel;
  onRemove: (cartItemId: string) => void;
}

export function CartItem({ item, onRemove }: CartItemProps) {
  const { cartItemId, name, imageUrl, color, storage, unitPrice } = item;

  return (
    <li className={styles.row}>
      <span className={styles.imageWrapper}>
        <Image
          src={normalizeImageUrl(imageUrl)}
          alt={name}
          fill
          className={styles.image}
          sizes="(max-width: 834px) 146px, 240px"
        />
      </span>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        {/* CONFIRMED — the Figma line reads "512 GB | VIOLETA TITANIUM", i.e.
            storage first, then colour, separated by a pipe. */}
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
}
