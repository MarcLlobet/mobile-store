"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Icon } from "@/components/primitives/Icon";
import { Badge } from "@/components/primitives/Badge";
import styles from "./Header.module.css";

/**
 * Frozen contract (plan §4): no props — reads `useCart()` itself. Phase 1
 * never touches this component; it is rendered once, globally, from
 * `app/layout.tsx`.
 */
export function Header() {
  const { itemCount } = useCart();
  const cartLabel = `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/" className={styles.homeLink} aria-label="Go to home">
          <Icon name="home" ariaHidden />
          <span>Mobile Store</span>
        </Link>
        <Link href="/cart" className={styles.cartLink} aria-label={cartLabel}>
          <Icon name="cart" ariaHidden />
          <Badge count={itemCount} />
        </Link>
      </nav>
    </header>
  );
}
