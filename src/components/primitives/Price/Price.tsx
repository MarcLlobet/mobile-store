import styles from "./Price.module.css";

/** Frozen contract (plan §4). Formats via Intl.NumberFormat, currency defaults to EUR (the API's currency, confirmed via the brief's listed prices). */
export interface PriceProps {
  value: number;
  currency?: string;
}

export function Price({ value, currency = "EUR" }: PriceProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);

  return <span className={styles.price}>{formatted}</span>;
}
