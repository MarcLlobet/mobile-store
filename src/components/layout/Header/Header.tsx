"use client";

import Link from "next/link";

import { Icon } from "@/components/primitives/Icon";
import { useCart } from "@/context/CartContext";

import styles from "./Header.module.css";

const LOGO_WIDTH = 77;

export const Header = () => {
  const { itemCount } = useCart();
  const cartLabel = `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/" className={styles.homeLink} aria-label="Go to home">
          <Icon name="logo" size={LOGO_WIDTH} ariaHidden />
        </Link>
        <Link href="/cart" className={styles.cartLink} aria-label={cartLabel}>
          <Icon name={itemCount > 0 ? "bag-filled" : "bag-empty"} ariaHidden />
          <span className={styles.cartCount}>{itemCount}</span>
        </Link>
      </nav>
    </header>
  );
};
