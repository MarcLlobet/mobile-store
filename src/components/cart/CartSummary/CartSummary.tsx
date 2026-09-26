"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/primitives/Button";
import { Price } from "@/components/primitives/Price";
import { useTranslation } from "@/i18n";

import styles from "./CartSummary.module.css";

export interface CartSummaryProps {
  totalPrice: number;
  onPay?: () => void;
}

export const CartSummary = ({ totalPrice, onPay }: CartSummaryProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className={styles.summary}>
      <Button variant="standard" onClick={() => router.push("/")}>
        {t("cart.continue_shopping")}
      </Button>
      <div className={styles.totalRow}>
        <span id="cart-total-label" className={styles.totalLabel}>
          {t("cart.total")}
        </span>
        <span aria-labelledby="cart-total-label" className={styles.totalValue}>
          <Price value={totalPrice} />
        </span>
      </div>
      {totalPrice ? (
        <Button variant="primary" onClick={onPay}>
          {t("cart.pay")}
        </Button>
      ) : null}
    </div>
  );
};
