"use client";

import { useCart } from "@/context/CartContext";
import { CartList } from "@/components/cart/CartList";
import { CartSummary } from "@/components/cart/CartSummary";
import styles from "./page.module.css";

/**
 * Cart view. Pure client-side `useCart()` consumer — there is nothing to
 * fetch or SSG here, the cart lives entirely in localStorage (see
 * `CartContext`). This is the only place in the cart subtree that reads the
 * cart context; `CartList`/`CartItem`/`CartSummary` are all prop-driven so
 * they stay agnostic and Storybook-friendly (plan §4/§Cart).
 *
 * Layout mirrors the Figma cart frames: a full-height screen with the heading
 * at the top, the items filling the middle, and the action bar (continue
 * shopping / total / pay) on the bottom edge of the viewport.
 *
 * An empty cart is the *same* screen, not a different one — the heading reads
 * "Cart (0)", the rows area is simply empty, and the action bar stays where it
 * is showing a 0 total. There is no empty-state card: the frames don't draw a
 * box there, and swapping to a bespoke empty page would move the controls the
 * moment the last item is removed.
 */
export default function CartPage() {
  const { items, itemCount, removeItem, totalPrice } = useCart();

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>{`Cart (${itemCount})`}</h1>
      <div className={styles.content}>
        {items.length > 0 && <CartList items={items} onRemove={removeItem} />}
      </div>
      <CartSummary totalPrice={totalPrice} />
    </main>
  );
}
