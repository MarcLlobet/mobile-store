"use client";

import type { MouseEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/primitives/Icon";
import { useTranslation } from "@/i18n";

import styles from "./BackButton.module.css";

declare global {
  var navigation: { readonly canGoBack: boolean } | undefined;
}

export interface BackButtonProps {
  href?: string;
}

const opensElsewhere = (event: MouseEvent<HTMLAnchorElement>): boolean =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

const hasSomewhereToReturnTo = (): boolean => globalThis.navigation?.canGoBack ?? false;

export const BackButton = ({ href = "/" }: BackButtonProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const returnToPreviousPage = (event: MouseEvent<HTMLAnchorElement>) => {
    if (opensElsewhere(event) || !hasSomewhereToReturnTo()) {
      return;
    }
    event.preventDefault();
    router.back();
  };

  return (
    <Link
      href={href}
      className={styles.link}
      aria-label={t("detail.back_label")}
      onClick={returnToPreviousPage}
    >
      <Icon name="back" ariaHidden />
      <span>{t("detail.back")}</span>
    </Link>
  );
};
