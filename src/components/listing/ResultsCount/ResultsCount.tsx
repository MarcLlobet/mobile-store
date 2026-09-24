import styles from "./ResultsCount.module.css";

export interface ResultsCountProps {
  count: number;
  isLoading?: boolean;
}

/**
 * Search results indicator (brief §1: "must include an indicator showing
 * the number of results found"; Figma renders this as e.g. "20 RESULTS",
 * uppercased via CSS). `aria-live="polite"` so screen readers announce
 * updates as the debounced search settles, without the visible text ever
 * needing focus.
 */
export function ResultsCount({ count, isLoading = false }: ResultsCountProps) {
  const message = isLoading
    ? "Searching…"
    : count === 0
      ? "No results"
      : count === 1
        ? "1 result"
        : `${count} results`;

  return (
    <p className={styles.resultsCount} role="status" aria-live="polite">
      {message}
    </p>
  );
}
