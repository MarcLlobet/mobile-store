"use client";

import Image from "next/image";

import { Price } from "@/components/primitives/Price";
import { useTranslation } from "@/i18n";
import { normalizeImageUrl } from "@/lib/utils/normalizeImageUrl";
import type { CartItem as CartItemModel } from "@/types/cart";

import styles from "./CartItem.module.css";

export interface CartItemProps {
  item: CartItemModel;
  onRemove: (cartItemId: string) => void;
}

export const CartItem = ({ item, onRemove }: CartItemProps) => {
  const { cartItemId, name, imageUrl, color, storage, unitPrice } = item;
  const { t } = useTranslation();

  return (
    <li className={styles.row}>
      <span className={styles.imageWrapper}>
        <Image
          src={normalizeImageUrl(imageUrl)}
          alt={name}
          unoptimized
          fill
          className={styles.image}
          sizes="(max-width: 834px) 146px, 240px"
        />
      </span>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.specs}>{t("cart.item_variant", { storage, color })}</span>
        <span className={styles.price}>
          <Price value={unitPrice} />
        </span>
        <button
          type="button"
          className={styles.remove}
          aria-label={t("cart.remove_label", { name })}
          onClick={() => onRemove(cartItemId)}
        >
          {t("cart.remove")}
        </button>
      </div>
    </li>
  );
};
