import { memo, useId } from "react";

import type { ProductSpecs } from "@/lib/api/types";

import styles from "./SpecsList.module.css";

const SPEC_FIELDS: readonly { readonly key: keyof ProductSpecs; readonly label: string }[] = [
  { key: "screen", label: "Screen" },
  { key: "resolution", label: "Resolution" },
  { key: "processor", label: "Processor" },
  { key: "mainCamera", label: "Main camera" },
  { key: "selfieCamera", label: "Selfie camera" },
  { key: "battery", label: "Battery" },
  { key: "os", label: "OS" },
  { key: "screenRefreshRate", label: "Screen refresh rate" },
];

export interface SpecsListProps {
  readonly brand: string;
  readonly name: string;
  readonly specs: ProductSpecs;
  readonly description: string;
}

const SpecsTable = ({ brand, name, specs, description }: SpecsListProps) => {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId} className={styles.heading}>
        Specifications
      </h2>
      <dl className={styles.list}>
        <div className={styles.row}>
          <dt className={styles.term}>Brand</dt>
          <dd className={styles.value}>{brand}</dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.term}>Name</dt>
          <dd className={styles.value}>{name}</dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.term}>Description</dt>
          <dd className={styles.value}>{description}</dd>
        </div>
        {SPEC_FIELDS.map(({ key, label }) => (
          <div className={styles.row} key={key}>
            <dt className={styles.term}>{label}</dt>
            <dd className={styles.value}>{specs[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export const SpecsList = memo(SpecsTable);
