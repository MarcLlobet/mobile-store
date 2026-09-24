import styles from "./Price.module.css";

/**
 * Frozen contract (plan §4), format updated to match the Figma design
 * exactly: a plain rounded number followed by the currency code — "1199
 * EUR" — with no currency symbol, thousands separator, or decimals
 * (confirmed against every price shown in design/figma-reference/).
 */
export interface PriceProps {
  value: number;
  currency?: string;
}

export function Price({ value, currency = "EUR" }: PriceProps) {
  const formatted = `${Math.round(value)} ${currency}`;

  return <span className={styles.price}>{formatted}</span>;
}
