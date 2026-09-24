"use client";

import { useRouter } from "next/navigation";
import { Price } from "@/components/primitives/Price";
import { Button } from "@/components/primitives/Button";
import styles from "./CartSummary.module.css";

/**
 * Prop-driven — `totalPrice` is passed in from `app/cart/page.tsx`, the only
 * place in this subtree that reads `useCart()`. The "Continue shopping"
 * button owns its own navigation via `useRouter`, which is why this file
 * needs its own `"use client"` boundary (mirrors `layout/Header`).
 */
export interface CartSummaryProps {
  totalPrice: number;
}

export function CartSummary({ totalPrice }: CartSummaryProps) {
  const router = useRouter();

  return (
    <div className={styles.summary}>
      <div className={styles.totalRow}>
        <span id="cart-total-label" className={styles.totalLabel}>
          Total
        </span>
        <span aria-labelledby="cart-total-label" className={styles.totalValue}>
          <Price value={totalPrice} />
        </span>
      </div>
      <Button variant="standard" onClick={() => router.push("/")}>
        Continue shopping
      </Button>
    </div>
  );
}
