import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  /** The search query that produced zero results, if any. */
  query?: string;
}

/**
 * Shown when a search returns zero results (brief §1 / Figma "Results"
 * state with no matches). `ResultsCount` already announces "No results
 * found" via its own `aria-live` region, so this block is purely visual and
 * does not repeat that announcement.
 */
export function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.message}>
        {query ? <>No phones match &ldquo;{query}&rdquo;.</> : "No phones found."}
      </p>
      <p className={styles.hint}>Try a different name or brand.</p>
    </div>
  );
}
