"use client";

import { CartList } from "@/components/cart/CartList";
import { CartSummary } from "@/components/cart/CartSummary";
import { Page } from "@/components/layout/Page";
import { useTranslation } from "@/i18n";
import type { CartItem } from "@/types/cart";

import styles from "./CartView.module.css";

export interface CartViewProps {
  items: readonly CartItem[];
  totalPrice: number;
  onRemove: (cartItemId: string) => void;
}

export const CartView = ({ items, totalPrice, onRemove }: CartViewProps) => {
  const { t } = useTranslation();

  return (
    <Page className={styles.main}>
      <h1 className={styles.heading}>{t("cart.heading", { count: items.length })}</h1>
      <div className={styles.content}>
        {items.length > 0 ? <CartList items={items} onRemove={onRemove} /> : null}
      </div>
      <CartSummary totalPrice={totalPrice} />
    </Page>
  );
};
