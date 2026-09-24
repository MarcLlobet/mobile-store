"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Icon } from "@/components/primitives/Icon";
import styles from "./Header.module.css";

/**
 * Frozen contract (plan §4): no props — reads `useCart()` itself. Phase 1
 * never touches this component; it is rendered once, globally, from
 * `app/layout.tsx`.
 *
 * The cart control matches the real Figma "Bag" component (id 20605:4459)
 * exactly: the icon itself swaps between two real variants depending on
 * cart state — "Bag icon / State=Inactive" (empty) vs "State=Active" (≥1
 * item) — and the count is plain text sitting next to the icon, always
 * rendered (including "0"), never a hidden/filled pill badge.
 */
export function Header() {
  const { itemCount } = useCart();
  const cartLabel = `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/" className={styles.homeLink} aria-label="Go to home">
          <Icon name="logo" ariaHidden />
        </Link>
        <Link href="/cart" className={styles.cartLink} aria-label={cartLabel}>
          <Icon name={itemCount > 0 ? "bag-filled" : "bag-empty"} ariaHidden />
          <span className={styles.cartCount}>{itemCount}</span>
        </Link>
      </nav>
    </header>
  );
}
