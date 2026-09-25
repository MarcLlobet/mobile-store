"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/primitives/Button";
import { Price } from "@/components/primitives/Price";

import styles from "./CartSummary.module.css";

export interface CartSummaryProps {
  readonly totalPrice: number;
  readonly onPay?: () => void;
}

export const CartSummary = ({ totalPrice, onPay }: CartSummaryProps) => {
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
      {totalPrice ? (
        <Button variant="primary" onClick={onPay}>
          Pay
        </Button>
      ) : null}
    </div>
  );
};
