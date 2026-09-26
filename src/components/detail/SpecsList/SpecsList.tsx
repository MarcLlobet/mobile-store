"use client";

import { memo, useId } from "react";

import { useTranslation, type MessageKey } from "@/i18n";
import type { ProductSpecs } from "@/lib/api/types";

import styles from "./SpecsList.module.css";

const SPEC_FIELDS: readonly { key: keyof ProductSpecs; labelKey: MessageKey }[] = [
  { key: "screen", labelKey: "specs.screen" },
  { key: "resolution", labelKey: "specs.resolution" },
  { key: "processor", labelKey: "specs.processor" },
  { key: "mainCamera", labelKey: "specs.main_camera" },
  { key: "selfieCamera", labelKey: "specs.selfie_camera" },
  { key: "battery", labelKey: "specs.battery" },
  { key: "os", labelKey: "specs.os" },
  { key: "screenRefreshRate", labelKey: "specs.screen_refresh_rate" },
];

export interface SpecsListProps {
  brand: string;
  name: string;
  specs: ProductSpecs;
  description: string;
}

const SpecsTable = ({ brand, name, specs, description }: SpecsListProps) => {
  const headingId = useId();
  const { t } = useTranslation();

  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId} className={styles.heading}>
        {t("specs.heading")}
      </h2>
      <dl className={styles.list}>
        <div className={styles.row}>
          <dt className={styles.term}>{t("specs.brand")}</dt>
          <dd className={styles.value}>{brand}</dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.term}>{t("specs.name")}</dt>
          <dd className={styles.value}>{name}</dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.term}>{t("specs.description")}</dt>
          <dd className={styles.value}>{description}</dd>
        </div>
        {SPEC_FIELDS.map(({ key, labelKey }) => (
          <div className={styles.row} key={key}>
            <dt className={styles.term}>{t(labelKey)}</dt>
            <dd className={styles.value}>{specs[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export const SpecsList = memo(SpecsTable);
