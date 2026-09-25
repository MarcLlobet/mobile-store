import styles from "./ResultsCount.module.css";

export interface ResultsCountProps {
  readonly count: number;
  readonly isLoading?: boolean;
}

const resultsMessage = (count: number): string => {
  if (count === 0) {
    return "No results";
  }
  return count === 1 ? "1 result" : `${count} results`;
};

export const ResultsCount = ({ count, isLoading = false }: ResultsCountProps) => (
  <p className={styles.resultsCount} role="status" aria-live="polite">
    {isLoading ? "Searching…" : resultsMessage(count)}
  </p>
);
