import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  readonly query?: string;
}

export const EmptyState = ({ query }: EmptyStateProps) => (
  <div className={styles.emptyState}>
    <p className={styles.message}>
      {query ? <>No phones match &ldquo;{query}&rdquo;.</> : "No phones found."}
    </p>
    <p className={styles.hint}>Try a different name or brand.</p>
  </div>
);
