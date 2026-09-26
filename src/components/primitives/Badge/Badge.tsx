import styles from "./Badge.module.css";

export interface BadgeProps {
  count: number;
}

export const Badge = ({ count }: BadgeProps) => {
  if (count <= 0) {
    return null;
  }

  return <span className={styles.badge}>{count}</span>;
};
