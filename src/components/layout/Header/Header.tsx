"use client";

import Link from "next/link";

import { BagIcon } from "@/components/primitives/BagIcon";
import { Icon } from "@/components/primitives/Icon";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/i18n";

import styles from "./Header.module.css";

const LOGO_WIDTH = 77;

export const Header = () => {
  const { itemCount } = useCart();
  const { t, plural } = useTranslation();

  return (
    <header className={styles.header} data-view-transition="site-header">
      <nav className={styles.nav} aria-label={t("header.nav_label")}>
        <Link href="/" className={styles.homeLink} aria-label={t("header.home_label")}>
          <Icon name="logo" size={LOGO_WIDTH} ariaHidden />
        </Link>
        <Link
          href="/cart"
          className={styles.cartLink}
          aria-label={plural("header.cart_label", itemCount)}
        >
          <BagIcon filled={itemCount > 0} />
          <span className={styles.cartCount}>{itemCount}</span>
        </Link>
      </nav>
    </header>
  );
};
