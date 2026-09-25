import { DEFAULT_CURRENCY, formatPrice } from "@/lib/utils/formatPrice";

import styles from "./Price.module.css";

export interface PriceProps {
  readonly value: number;
  readonly currency?: string;
}

export const Price = ({ value, currency = DEFAULT_CURRENCY }: PriceProps) => (
  <span className={styles.price}>{formatPrice(value, currency)}</span>
);
