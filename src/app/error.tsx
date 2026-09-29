"use client";

import { Page } from "@/components/layout/Page";
import { Button } from "@/components/primitives/Button";
import { useTranslation } from "@/i18n";
import { ApiError } from "@/lib/api/api";

import styles from "./error.module.css";

const NOT_FOUND_STATUS = 404;

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const messageKeyFor = (error: Error) => {
  if (!(error instanceof ApiError)) {
    return "error.message" as const;
  }
  return error.status === NOT_FOUND_STATUS
    ? ("error.not_found_message" as const)
    : ("error.api_message" as const);
};

const ErrorBoundary = ({ error, reset }: ErrorBoundaryProps) => {
  const { t } = useTranslation();

  return (
    <Page className={styles.wrapper}>
      <h1 className={styles.heading}>{t("error.heading")}</h1>
      <p className={styles.message} role="alert">
        {t(messageKeyFor(error))}
      </p>
      <Button variant="primary" onClick={reset}>
        {t("error.retry")}
      </Button>
    </Page>
  );
};

export default ErrorBoundary;
