"use client";

import { useRouter } from "next/navigation";
import { Price } from "@/components/primitives/Price";
import { Button } from "@/components/primitives/Button";
import styles from "./CartSummary.module.css";

/**
 * The cart's bottom action bar. Prop-driven — `totalPrice` comes from
 * `app/cart/page.tsx`, the only place in this subtree that reads `useCart()`.
 * "Continue shopping" owns its own navigation via `useRouter`, which is why
 * this file needs its own `"use client"` boundary (mirrors `layout/Header`).
 *
 * DOM order is continue -> total -> pay, which is also the reading order on
 * tablet and desktop. Mobile stacks the total onto its own line above the two
 * buttons; that is done with `order`/wrapping in CSS rather than by reordering
 * the markup, so the tab order stays identical at every width.
 */
export interface CartSummaryProps {
  totalPrice: number;
  /** Checkout has no destination in this app — see the note in the README. */
  onPay?: () => void;
}

export function CartSummary({ totalPrice, onPay }: CartSummaryProps) {
  const router = useRouter();

  return (
    <div className={styles.summary}>
      <Button variant="standard" onClick={() => router.push("/")}>
        Continue shopping
      </Button>
      <div className={styles.totalRow}>
        <span id="cart-total-label" className={styles.totalLabel}>
          Total
        </span>
        <span aria-labelledby="cart-total-label" className={styles.totalValue}>
          <Price value={totalPrice} />
        </span>
      </div>
      {!!totalPrice && (
        <Button variant="primary" onClick={onPay}>
          Pay
        </Button>
      )}
    </div>
  );
}
