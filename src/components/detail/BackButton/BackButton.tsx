"use client";

import Link from "next/link";

import { Icon } from "@/components/primitives/Icon";
import { useTranslation } from "@/i18n";

import styles from "./BackButton.module.css";

export interface BackButtonProps {
  href?: string;
}

export const BackButton = ({ href = "/" }: BackButtonProps) => {
  const { t } = useTranslation();

  return (
    <Link href={href} className={styles.link} aria-label={t("detail.back_label")}>
      <Icon name="back" ariaHidden />
      <span>{t("detail.back")}</span>
    </Link>
  );
};
