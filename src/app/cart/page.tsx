"use client";

import { useCart } from "@/context/CartContext";
import { CartList } from "@/components/cart/CartList";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import styles from "./page.module.css";

/**
 * Cart view. Pure client-side `useCart()` consumer — there is nothing to
 * fetch or SSG here, the cart lives entirely in localStorage (see
 * `CartContext`). This is the only place in the cart subtree that reads the
 * cart context; `CartList`/`CartItem`/`CartSummary`/`EmptyCart` are all
 * prop-driven so they stay agnostic and Storybook-friendly (plan §4/§Cart).
 */
export default function CartPage() {
  const { items, itemCount, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <main className={styles.main}>
        <h1 className={styles.heading}>{`Cart (${itemCount})`}</h1>
        <EmptyCart />
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>{`Cart (${itemCount})`}</h1>
      <CartList items={items} onRemove={removeItem} />
      <CartSummary totalPrice={totalPrice} />
    </main>
  );
}
