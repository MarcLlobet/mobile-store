"use client";

import { CartItem } from "@/components/cart/CartItem";
import { useTranslation } from "@/i18n";
import type { CartItem as CartItemModel } from "@/types/cart";

import styles from "./CartList.module.css";

export interface CartListProps {
  items: readonly CartItemModel[];
  onRemove: (cartItemId: string) => void;
}

export const CartList = ({ items, onRemove }: CartListProps) => {
  const { t } = useTranslation();

  return (
    <ul className={styles.list} aria-label={t("cart.list_label")}>
      {items.map((item) => (
        <CartItem key={item.cartItemId} item={item} onRemove={onRemove} />
      ))}
    </ul>
  );
};
