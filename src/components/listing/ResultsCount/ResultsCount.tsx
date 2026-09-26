"use client";

import { useTranslation } from "@/i18n";

import styles from "./ResultsCount.module.css";

export interface ResultsCountProps {
  count: number;
  isLoading?: boolean;
}

export const ResultsCount = ({ count, isLoading = false }: ResultsCountProps) => {
  const { t, plural } = useTranslation();

  return (
    <p className={styles.resultsCount} role="status" aria-live="polite">
      {isLoading ? t("listing.searching") : plural("listing.results", count)}
    </p>
  );
};
