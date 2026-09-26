"use client";

import { CartList } from "@/components/cart/CartList";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/i18n";

import styles from "./page.module.css";

const CartPage = () => {
  const { items, itemCount, removeItem, totalPrice } = useCart();
  const { t } = useTranslation();

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>{t("cart.heading", { count: itemCount })}</h1>
      <div className={styles.content}>
        {items.length > 0 ? <CartList items={items} onRemove={removeItem} /> : null}
      </div>
      <CartSummary totalPrice={totalPrice} />
    </main>
  );
};

export default CartPage;
