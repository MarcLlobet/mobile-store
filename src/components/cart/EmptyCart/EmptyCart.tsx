"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import styles from "./EmptyCart.module.css";

/**
 * Self-contained empty state (matches Figma's "Cart / Empty"). Takes no
 * props — an empty cart has nothing cart-context-specific to display, only
 * a message and its own "Continue shopping" affordance so it isn't a dead
 * end. Owns its own navigation via `useRouter`, hence its own `"use client"`
 * boundary (mirrors `layout/Header` and `CartSummary`).
 */
export function EmptyCart() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <Icon name="cart" size={48} ariaHidden />
      <p className={styles.message}>Your cart is empty.</p>
      <Button variant="primary" onClick={() => router.push("/")}>
        Continue shopping
      </Button>
    </div>
  );
}
