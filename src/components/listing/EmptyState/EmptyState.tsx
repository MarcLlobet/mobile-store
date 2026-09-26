"use client";

import { useTranslation } from "@/i18n";

import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  query?: string;
}

export const EmptyState = ({ query }: EmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyState}>
      <p className={styles.message}>
        {query ? t("listing.empty_for_query", { query }) : t("listing.empty")}
      </p>
      <p className={styles.hint}>{t("listing.empty_hint")}</p>
    </div>
  );
};
