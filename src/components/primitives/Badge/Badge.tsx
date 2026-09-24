import styles from "./Badge.module.css";

/** Frozen contract (plan §4): renders nothing at count === 0. */
export interface BadgeProps {
  count: number;
}

export function Badge({ count }: BadgeProps) {
  if (count <= 0) {
    return null;
  }

  return <span className={styles.badge}>{count}</span>;
}
